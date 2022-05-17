package com.reactnativetenmaxsdk;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = TenmaxSdkModule.NAME)
public class TenmaxSdkModule extends ReactContextBaseJavaModule {
    public static final String NAME = "TenmaxSdk";
    public static final String KEY_PREFERENCE = "Preference";
    public static final String KEY_EVENTS = "Events";

    public TenmaxSdkModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void savePreference(String json, Promise promise) {
      getEditor().putString(KEY_PREFERENCE, json).commit();
      promise.resolve("Ok");
    }

    @ReactMethod
    public void loadPreference(Promise promise) {
      promise.resolve(getPreferences().getString(KEY_PREFERENCE, ""));
    }

    @ReactMethod
    public void saveEvents(String json, Promise promise) {
      getEditor().putString(KEY_EVENTS, json).commit();
      promise.resolve("Ok");
    }

    @ReactMethod
    public void loadEvents(Promise promise) {
      promise.resolve(getPreferences().getString(KEY_EVENTS, ""));
    }

    @ReactMethod
    public void clearEvents(Promise promise) {
      getEditor().putString(KEY_EVENTS, "").commit();
      promise.resolve("Ok");
    }    

    private SharedPreferences getPreferences() {
      return getReactApplicationContext().getSharedPreferences(NAME, Context.MODE_PRIVATE);
    }

    private SharedPreferences.Editor getEditor() {
      return getPreferences().edit();
    }

    public static native int nativeMultiply(int a, int b);
}
