# react-native-tenmax-sdk

SDK for TenMax ECDMP

## Getting Started

To get started with the SDK, run `yarn` in the root directory to install the required dependencies for each package:

```sh
yarn
```

> While it's possible to use [`npm`](https://github.com/npm/cli), the tooling is built around [`yarn`](https://classic.yarnpkg.com/), so you'll have an easier time if you use `yarn` for development.

You can run the [example app](/example/) to try out the SDK features.

To start the packager:

```sh
yarn example start
```

To run the example app on Android:

```sh
yarn example android
```

To run the example app on iOS:

```sh
yarn example ios
```

## SDK Installation

Assume our new project folder structure is as below:

```
-- my_new_project
|_ react-native-tenmax-sdk
```

STEP 1. Install the library with yarn

```sh
yarn add ../react-native-tenmax-sdk
```

STEP 2. Install iOS dependencies with CocoaPods
```sh
cd my_new_project/ios
pod install
```

## Usage

**1. Import the SDK**

```js
import { EcDMPSDK, EventType } from 'react-native-tenmax-sdk';
```

**2. Call `EcDMPSDK.init(feedId, bundleId)` once when application starts.**

```js
EcDMPSDK.init('com.example.app.bundleId', 'FEED-ID-1234-5678');
```

**3. Call `EcDMPSDK.identify(customerId, email, phone, deviceId, extra)` after user login**

```js
const customerId = '10001'
const email = 'email@example.com'
const phone = '0912345678'
const deviceId = 'AABBCCDD12345678'
const extra = {
  country: 'tw',
  gender: 'male',
  anykey: 'any value',
  anotherkey: 'another value'
}

EcDMPSDK.identify(
  customerId,
  email,
  phone,
  deviceId,
  extra
)
```

> `extra` is optional, arbitrary array.
>
> `customerId`, `email`, `phone`, `deviceId` will be saved after calling `identify()`
>
> You may call `EcDMPSDK.reset()` to clear these settings and the remaining events in queue after user logout.

**4. Call `EcDMPSDK.event(eventType, eventData, uri, referer, utm, forceFlush)` to track events.**

```js
// Track a pageView event
const eventType = 'pageView'
const eventData = {}
const uri = '/categories/3c/123'
const referer = 'home'
const utm = 'utm_content=buffercf3b2&utm_medium=social&utm_source=facebook.com&utm_campaign=buffer'
const forceFlush = false

EcDMPSDK.event(
  eventType,
  eventData,
  uri,
  referer,
  utm,
  forceFlush
);
```

> Events are queue and processed in batch, for events that require to be delivered immediately, set `forceFlush` to `true`. All queued events will be flushed altogether after an event with `forceFlush = true` is been sent.

**5. Call `EcDMPSDK.optOut()` to enable / disable event tracking**

Events will be delivered when optOut is set to `false`. (default)

```js
EcDMPSDK.optOut(false)
```

Events will **NOT** be delivered when optOut is set to `true`.

```js
EcDMPSDK.optOut(true)
```

Refer to the [example app](/example/) for complete usage demonstrations of all event types.

[`./example/src/App.js`](/example/src/App.js)

Sample events data can be found under:

[`./example/src/MockData.js`](/example/src/MockData.js)

## Event Types

Event types are defined as enum of strings for convenience purpose.

Predefined event types includes:
- pageView
- completeRegistration
- appInstall
- search
- listContent
- listView
- viewContent
- addToWishlist
- addToCart
- viewCart
- addPaymentInfo
- initiateCheckout
- purchase

Usage:

```js
import { EcDMPSDK, EventType } from 'react-native-tenmax-sdk';

//...

EcDMPSDK.event(
  EventType.pageView,
  ...
)

```

is the same as

```js

EcDMPSDK.event(
  'pageView',
  ...
)

```

## License

Copyright (C) TenMax
