import { NativeModules, Platform } from 'react-native';
import {
  EVENT_FLUSH_INTERVAL_MS,
  SESSION_EXPIRE_MS,
  EVENT_QUEUE_MAX,
} from '../constants';
import EcdmpApi from './api/EcdmpApi';
import Preference from './Preference';
import uuid from 'react-native-uuid';
import { EventType } from '../enums';
import AsyncLock from 'async-lock';

const LINKING_ERROR =
  `The package 'react-native-tenmax-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const TenmaxSdk = NativeModules.TenmaxSdk
  ? NativeModules.TenmaxSdk
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export default class TenMax {
  private static preference: Preference = new Preference();
  private static events: Array<Object> = [];
  private static flushCallback: ((result: string) => void) | null = null;
  private static timer: ReturnType<typeof setTimeout>;
  private static lock = new AsyncLock();
  /**
   * Init the library
   * @param bundleId bundleId
   * @param feedId feedId
   * @returns Promise<Preference>
   */
  static async init(bundleId: string, feedId: string): Promise<Preference> {
    this.debugLog(`init() with bundleId ${bundleId}, feedId ${feedId}`);
    // load preferences
    this.preference = await this.loadPreference();
    this.preference.bundleId = bundleId;
    this.preference.feedId = feedId;
    this.sessionId(false);
    this.visitorId(false);
    // save updated preferences
    await this.savePreference(this.preference);
    // load unsent events from last time
    this.events = await this.getEvents();
    // begin scheduled check
    this.scheduleFlushCheck();
    return this.preference;
  }

  static setFlushCallback(callback: (result: string) => void) {
    this.flushCallback = callback;
  }

  /**
   * Opt in / out event tracking
   * @param isOptOut true to opt out events tracking
   */
  static async optOut(isOptOut: true | false): Promise<Preference> {
    const preference = await this.loadPreference();
    preference.optOut = isOptOut;
    await this.savePreference(preference);
    if (isOptOut) {
      // handle concurrency
      this.lock.acquire(
        'eventQueue',
        () => {
          this.emptyEvents();
        },
        () => {
          this.debugLog(`AsyncLock released`);
        }
      );
    }
    return preference;
  }

  /**
   * Check for events to flush on timely basis
   */
  private static scheduleFlushCheck() {
    // prevent multiple init
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      // handle concurrency
      this.lock.acquire(
        'eventQueue',
        (done) => {
          this.flushEvents().then(() => done());
        },
        () => {
          this.debugLog(`AsyncLock released`);
        }
      );
      this.scheduleFlushCheck();
    }, EVENT_FLUSH_INTERVAL_MS);
    this.debugLog(`scheduleFlushCheck - setTimeout = ${this.timer}`);
  }

  /**
   * Flush all events
   */
  private static async flushEvents() {
    if (this.preference.optOut) {
      this.debugLog('EcDMPSDK opt out, no flush.');
      return;
    }
    const events = await this.getEvents();
    if (events.length === 0) {
      this.debugLog('EcDMPSDK: No event to flush');
      return;
    }
    this.debugLog(`flushing ${events.length} events...`);
    try {
      const result = await EcdmpApi.postEvents(events);
      const logStr = `EcDMPSDK flushed ${events.length} events (${result})`;
      await this.emptyEvents();
      if (this.flushCallback) {
        this.flushCallback(logStr);
      }
    } catch (error) {
      this.debugLog('EcDMPSDK flush failed');
      this.debugLog(error);
    }
  }

  /**
   * Generate SessionId if no valid SessionId exists.
   *
   * Format: Unix Timestamp
   *
   * Expires:
   * - 30 minutes without new event delivery
   * - Over midnight (local date changed)
   */
  static sessionId(shouldSave: boolean = true): string {
    const now = new Date();
    const timestamp = now.getTime();
    this.debugLog(
      `current timestamp = ${timestamp}, lets = ${this.preference.lets}, sid = ${this.preference.sid}`
    );
    const letsDateString = new Date(this.preference.lets).toLocaleDateString();
    const nowDateString = now.toLocaleDateString();
    // Generate new SID if expired
    if (
      timestamp - this.preference.lets > SESSION_EXPIRE_MS ||
      nowDateString !== letsDateString
    ) {
      this.preference.sid = Math.floor(timestamp / 1000).toString();
    }
    // update Last Event TimeStamp
    this.preference.lets = timestamp;
    if (shouldSave) {
      this.savePreference(this.preference);
    }
    return this.preference.sid;
  }

  /**
   * Generate UUID based visitor ID if not exists
   * @param shouldSave true to save to preference (default), false to only keep in memory
   * @returns Visitor ID
   */
  static visitorId(shouldSave: boolean = true): String {
    if (this.preference.vid.length === 0) {
      this.preference.vid = uuid.v4().toString();
      if (shouldSave) {
        this.savePreference(this.preference);
      }
    }
    return this.preference.vid;
  }

  /**
   * Save preference settings
   * @param preference SDK and User data
   * @returns "Ok"
   */
  static async savePreference(preference: Preference): Promise<String> {
    this.preference = preference;
    try {
      const result = await TenmaxSdk.savePreference(preference.serialize());
      this.debugLog(`savePreference ...${result}`);
      return result;
    } catch (error: any) {
      this.debugLog(`savePreference Error:`);
      this.debugLog(error);
      return '';
    }
  }

  /**
   * Load preference settings
   * @returns Preference saved last time or an Empty Preference instance if no saved data
   */
  static async loadPreference(): Promise<Preference> {
    try {
      const json = await TenmaxSdk.loadPreference();
      if (json && json.length !== 0) {
        return Preference.deserialize(json);
      }
    } catch (error: any) {
      this.debugLog(`loadPreference Error!`);
      this.debugLog(error);
    }
    return new Preference();
  }

  static reset() {
    const newPreference = new Preference();
    newPreference.bundleId = this.preference.bundleId;
    newPreference.feedId = this.preference.feedId;
    newPreference.vid = this.preference.vid;
    this.savePreference(newPreference);
    // handle concurrency
    this.lock.acquire(
      'eventQueue',
      () => {
        this.emptyEvents();
      },
      () => {
        this.debugLog(`AsyncLock released emptyEvents`);
      }
    );
  }

  /**
   * Identify User
   * @param customerId Customer ID
   * @param email Customer email
   * @param phone Customer phone number
   * @param deviceId Unique device ID
   * @param extra (optional) Extra data, Array<String> or null
   * @returns true if success
   */
  static identify(
    customerId: string,
    email: string,
    phone: string,
    deviceId: string,
    extra: Array<string> | null = null
  ): boolean {
    this.debugLog(
      `identify() with customerId ${customerId}, email ${email}, phone ${phone}, deviceId ${deviceId}`
    );
    this.preference.cid = customerId;
    this.preference.did = deviceId;
    this.savePreference(this.preference);
    const data = {
      cid: customerId,
      em: email,
      pn: phone,
      did: deviceId,
      ext: extra,
    };
    this.event(EventType.identify, data);
    return true;
  }

  /**
   * Store event to queue for batch sending
   * @param eventType string such as 'pageView' or 'viewContent', defined in enum EventType
   * @param eventData Array of event data, depending on the event type
   * @returns void
   */
  static event = (
    eventType: string,
    eventData: any = null,
    uri = '',
    referer = '',
    utm = '',
    forceFlush = false
  ) => {
    this.lock.acquire(
      'eventQueue',
      (done) => {
        const json = JSON.stringify(eventData);
        this.debugLog(`event() with eventType ${eventType}, eventData ${json}`);
        const now = new Date();
        const event = {
          bundleId: this.preference.bundleId,
          dateTime: now.toISOString(),
          feedId: this.preference.feedId,
          did: this.preference.did,
          vid: this.preference.vid,
          cid: this.preference.cid,
          sid: this.sessionId(),
          uri: uri,
          referer: referer,
          utm: utm,
          eventType: eventType,
          eventData: eventData,
        };
        // handle concurrency
        this.pushEvent(event, forceFlush).then(() => done());
      },
      () => {
        this.debugLog('AsyncLock released pushEvent');
      }
    );
  };

  /**
   * Push event to queue
   * @param event New event to store
   */
  private static async pushEvent(event: Object, forceFlush: boolean) {
    this.events.push(event);
    // remove oldest event if queue size exceeds max limit
    if (this.events.length > EVENT_QUEUE_MAX) {
      this.events.shift();
      this.debugLog(
        `Exceeded Event Queue Maximum length ${EVENT_QUEUE_MAX}, remove bottom 1`
      );
    }
    try {
      await TenmaxSdk.saveEvents(JSON.stringify(this.events));
    } catch (error: any) {
      this.debugLog(`pushEvent (saveEvents) error!`);
      this.debugLog(error);
    }
    if (forceFlush || this.events.length > EVENT_QUEUE_MAX) {
      await this.flushEvents();
    }
  }

  /**
   * Load events from queue
   * @returns Array of Events
   */
  private static async getEvents(): Promise<Array<Object>> {
    try {
      const data = await TenmaxSdk.loadEvents();
      // this.debugLog(`getEvents got event data string '${data}', parsed to...`);
      if (data.length > 0) {
        this.events = JSON.parse(data);
        // this.debugLog(this.events);
        return this.events;
      } else {
        // this.debugLog('[]');
      }
    } catch (error: any) {
      this.debugLog(error);
    }
    return [];
  }

  /**
   * Clear event queue
   */
  static async emptyEvents() {
    try {
      this.debugLog('emptyEvents');
      this.events = [];
      await TenmaxSdk.clearEvents();
    } catch (error: any) {
      this.debugLog(error);
    }
  }

  static debugLog(message: any) {
    if (__DEV__) {
      console.log(message);
    }
  }
}
