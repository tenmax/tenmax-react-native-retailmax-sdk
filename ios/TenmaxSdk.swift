@objc(TenmaxSdk)
class TenmaxSdk: NSObject {
    static let KEY_PREFERENCE = "TenmaxSdkPreference"
    static let KEY_EVENTS = "TenmaxSdkEvents"

    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc(savePreference:withResolver:withRejecter:)
    func savePreference(json: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let userDefault = UserDefaults()
        userDefault.setValue(json, forKey: TenmaxSdk.KEY_PREFERENCE)
        resolve("Ok")
    }
    
    @objc(loadPreference:withRejecter:)
    func loadPreference(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        let userDefault = UserDefaults()
        guard let pref = userDefault.string(forKey: TenmaxSdk.KEY_PREFERENCE) else {
            resolve("")
            return
        }
        resolve(pref)
    }

    @objc(saveEvents:withResolver:withRejecter:)
    func saveEvents(json: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let userDefault = UserDefaults()
        userDefault.setValue(json, forKey: TenmaxSdk.KEY_EVENTS)
        resolve("Ok")
    }
    
    @objc(loadEvents:withRejecter:)
    func loadEvents(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        let userDefault = UserDefaults()
        guard let events = userDefault.string(forKey: TenmaxSdk.KEY_EVENTS) else {
            resolve("")
            return
        }
        resolve(events)
    }

    @objc(clearEvents:withRejecter:) 
    func clearEvents(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        let userDefault = UserDefaults()
        userDefault.setValue("", forKey: TenmaxSdk.KEY_EVENTS)
        resolve("Ok")
    }    
}
