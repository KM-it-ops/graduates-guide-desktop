use keyring::Entry;

const SERVICE: &str = "graduates-guide-desktop";

pub fn store_api_key(provider: &str, key: &str) -> Result<(), String> {
    let entry = Entry::new(SERVICE, &format!("api-key-{provider}"))
        .map_err(|e| e.to_string())?;
    entry.set_password(key).map_err(|e| e.to_string())
}

pub fn get_api_key(provider: &str) -> Result<Option<String>, String> {
    let entry = Entry::new(SERVICE, &format!("api-key-{provider}"))
        .map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(key) => Ok(Some(key)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

pub fn delete_api_key(provider: &str) -> Result<(), String> {
    let entry = Entry::new(SERVICE, &format!("api-key-{provider}"))
        .map_err(|e| e.to_string())?;
    match entry.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

pub fn crash_reports_enabled() -> Result<bool, String> {
    let entry = Entry::new(SERVICE, "crash-reports-opt-in").map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(v) => Ok(v == "true"),
        Err(keyring::Error::NoEntry) => Ok(false),
        Err(e) => Err(e.to_string()),
    }
}

pub fn set_crash_reports(enabled: bool) -> Result<(), String> {
    let entry = Entry::new(SERVICE, "crash-reports-opt-in").map_err(|e| e.to_string())?;
    entry
        .set_password(if enabled { "true" } else { "false" })
        .map_err(|e| e.to_string())
}
