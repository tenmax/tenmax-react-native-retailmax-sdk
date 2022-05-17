class Preference {
  optOut: boolean = false;
  feedId: string = '';
  bundleId: string = '';
  sid: string = '';
  vid: string = '';
  cid: string = '';
  did: string = '';
  lets: number = 0; // last Event (or sid generated) TimeStamp

  init(
    optOut: boolean,
    feedId: string,
    bundleId: string,
    sid: string,
    vid: string,
    cid: string,
    did: string,
    lets: number
  ) {
    this.optOut = optOut;
    this.feedId = feedId;
    this.bundleId = bundleId;
    this.sid = sid;
    this.vid = vid;
    this.cid = cid;
    this.did = did;
    this.lets = lets;
  }

  private toObject() {
    return {
      optOut: this.optOut,
      feedId: this.feedId,
      bundleId: this.bundleId,
      sid: this.sid,
      vid: this.vid,
      cid: this.cid,
      did: this.did,
      lets: this.lets,
    };
  }

  serialize(): string {
    return JSON.stringify(this.toObject());
  }

  static deserialize(json: string): Preference {
    const preference: ReturnType<Preference['toObject']> = JSON.parse(json);
    const p = new Preference();
    p.init(
      preference.optOut,
      preference.feedId,
      preference.bundleId,
      preference.sid,
      preference.vid,
      preference.cid,
      preference.did,
      preference.lets ?? 0
    );
    return p;
  }
}

export default Preference;
