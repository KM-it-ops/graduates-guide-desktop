use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

const APP_DIR_NAME: &str = "graduates-guide";
const CONFIG_FILE: &str = "config.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub vault_path: Option<String>,
    pub theme: String,
    pub engine_version: String,
    pub app_version: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            vault_path: None,
            theme: "dark".to_string(),
            engine_version: "1.11.0".to_string(),
            app_version: "0.1.0".to_string(),
        }
    }
}

fn config_path() -> Result<PathBuf, String> {
    let base = dirs::config_dir().ok_or_else(|| "Could not resolve config directory".to_string())?;
    Ok(base.join(APP_DIR_NAME).join(CONFIG_FILE))
}

pub fn load_config() -> Result<AppConfig, String> {
    let path = config_path()?;
    if !path.exists() {
        return Ok(AppConfig::default());
    }
    let raw = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&raw).map_err(|e| e.to_string())
}

pub fn save_config(config: &AppConfig) -> Result<(), String> {
    let path = config_path()?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let raw = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(path, raw).map_err(|e| e.to_string())
}

pub fn touch_vault_json(vault_path: &str, config: &AppConfig) -> Result<(), String> {
    let vault_json = Path::new(vault_path).join("vault.json");
    let now = Utc::now().to_rfc3339();
    let meta = if vault_json.exists() {
        let raw = fs::read_to_string(&vault_json).map_err(|e| e.to_string())?;
        let mut v: serde_json::Value =
            serde_json::from_str(&raw).unwrap_or_else(|_| serde_json::json!({}));
        v["lastOpenedAt"] = serde_json::Value::String(now);
        v["appVersion"] = serde_json::Value::String(config.app_version.clone());
        v["engineVersion"] = serde_json::Value::String(config.engine_version.clone());
        v
    } else {
        serde_json::json!({
            "version": 1,
            "appVersion": config.app_version,
            "engineVersion": config.engine_version,
            "importedAt": now,
            "lastOpenedAt": now,
        })
    };
    fs::write(
        &vault_json,
        serde_json::to_string_pretty(&meta).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())
}

pub fn read_vault_file(vault_path: &str, rel_path: &str) -> Result<String, String> {
    let vault = Path::new(vault_path).canonicalize().map_err(|e| e.to_string())?;
    let joined = vault.join(rel_path.trim_start_matches('/').replace('/', std::path::MAIN_SEPARATOR_STR));
    let canonical = joined.canonicalize().map_err(|e| format!("File not found: {rel_path} ({e})"))?;
    if !canonical.starts_with(&vault) {
        return Err("Path escapes vault boundary".to_string());
    }
    fs::read_to_string(&canonical).map_err(|e| e.to_string())
}

pub fn write_vault_file(vault_path: &str, rel_path: &str, content: &str) -> Result<(), String> {
    let allowed_prefixes = [
        "cv.md",
        "config/",
        "modes/_profile.md",
        "data/applications.md",
        "data/follow-ups.md",
    ];
    let normalized = rel_path.trim_start_matches('/').replace('/', std::path::MAIN_SEPARATOR_STR);
    let allowed = allowed_prefixes
        .iter()
        .any(|p| normalized == *p || normalized.starts_with(p));
    if !allowed {
        return Err(format!("Write not allowed for path: {rel_path}"));
    }
    let vault = Path::new(vault_path).canonicalize().map_err(|e| e.to_string())?;
    let joined = vault.join(&normalized);
    if let Some(parent) = joined.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let canonical = joined.canonicalize().unwrap_or(joined);
    if !canonical.starts_with(&vault) {
        return Err("Path escapes vault boundary".to_string());
    }
    fs::write(&canonical, content).map_err(|e| e.to_string())
}
