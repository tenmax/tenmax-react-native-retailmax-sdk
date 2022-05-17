# Developers

This documents is prepared for developers who will be maintaining this TenMax EcDMPSDK project.

## Programming languages and IDE

### Programming languages
- TypeScript (SDK)
- Javascript (example project)
- Swift (SDK iOS Native Module)
- Objective-C (SDK iOS Native Module; Only for declaring RCT_EXTERN_METHOD)
- Java (SDK Android Native Module)

### IDE
- Visual Studio Code
- XCode
- Android Studio

## Development workflow

To get started with the project, run `yarn` in the root directory to install the required dependencies for each package:

```sh
yarn
```

> While it's possible to use [`npm`](https://github.com/npm/cli), the tooling is built around [`yarn`](https://classic.yarnpkg.com/), so you'll have an easier time if you use `yarn` for development.

While developing, you can run the [example app](/example/) to test your changes. Any changes you make in your library's JavaScript code will be reflected in the example app without a rebuild. If you change any native code, then you'll need to rebuild the example app.

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

Make sure your code passes TypeScript and ESLint. Run the following to verify:

```sh
yarn typescript
yarn lint
```

To fix formatting errors, run the following:

```sh
yarn lint --fix
```

You may add tests for your change if possible. Run the unit tests by:

```sh
yarn test
```

To edit the Objective-C files, open `example/ios/TenmaxSdkExample.xcworkspace` in XCode and find the source files at `Pods > Development Pods > react-native-tenmax-sdk`.

To edit the Java files, open `example/android` in Android studio and find the source files at `reactnativetenmaxsdk` under `Android`.

### Linting and tests

[ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [TypeScript](https://www.typescriptlang.org/)

We use [TypeScript](https://www.typescriptlang.org/) for type checking, [ESLint](https://eslint.org/) with [Prettier](https://prettier.io/) for linting and formatting the code, and [Jest](https://jestjs.io/) for testing.

### Publishing to npm

We use [release-it](https://github.com/release-it/release-it) to make it easier to publish new versions. It handles common tasks like bumping version based on semver, creating tags and releases etc.

To publish new versions, run the following:

```sh
yarn release
```

### Scripts

The `package.json` file contains various scripts for common tasks:

- `yarn bootstrap`: setup project by installing all dependencies and pods.
- `yarn typescript`: type-check files with TypeScript.
- `yarn lint`: lint files with ESLint.
- `yarn test`: run unit tests with Jest.
- `yarn example start`: start the Metro server for the example app.
- `yarn example android`: run the example app on Android.
- `yarn example ios`: run the example app on iOS.

## Adding SDK methods

- Public methods are added in [Temax.ts](./src/classes/Tenmax.ts)
- Native modules (if required):
  - iOS: in [ios folder](./ios/)
    - **TenmaxSdk.m**: add RCT_EXTERN_METHOD
    - **TenmaxSdk.swift**: add implementation
  - Android: in [android folder](./android/src/main/java/com/reactnativetenmaxsdk)
    - **TenmaxSdkModule.java**: add @ReactMethod

## Source Files

- `./src/index.tsx`: Module exports
- `./src/constants.ts`: Defines API domain, event flush interval, and other constants.
- `./src/enums.ts`: Defines event types.
- `./src/classes/Tenmax.ts`: Primary SDK implementation.
- `./src/classes/Preference.ts`: Data model of SDK and User Preference.
- `./src/classes/api/EcdmpApi.ts`: API calls to TenMax ECDMP API endpoints.
- `./android/src/main/java/com/reactnativetenmaxsdk/TenmaxSdkPackage.java`: Registering Android Native Modules
- `./android/src/main/java/com/reactnativetenmaxsdk/TenmaxSdkModule.java`: Android Native Module functions
- `./ios/TenmaxSdk.m`: Expose iOS native methods to React Native’s bridge.
- `./ios/TenmaxSdk.swift`: iOS native methods implementations.
