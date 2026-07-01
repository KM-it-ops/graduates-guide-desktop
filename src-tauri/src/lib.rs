mod config;
mod engine;
mod secrets;

use config::{load_config, save_config, touch_vault_json, write_vault_file, AppConfig};
use engine::EngineService;
use std::sync::Mutex;
use tauri::State;

struct AppState {
    config: Mutex<AppConfig>,
    engine: EngineService,
}

#[tauri::command]
fn get_config(state: State<AppState>) -> Result<AppConfig, String> {
    Ok(state.config.lock().map_err(|e| e.to_string())?.clone())
}

#[tauri::command]
fn set_vault_path(path: String, state: State<AppState>) -> Result<AppConfig, String> {
    let mut config = state.config.lock().map_err(|e| e.to_string())?;
    config.vault_path = Some(path.clone());
    save_config(&config)?;
    touch_vault_json(&path, &config)?;
    Ok(config.clone())
}

#[tauri::command]
async fn pick_vault_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let folder = app
        .dialog()
        .file()
        .set_title("Select your Graduate's Guide vault folder")
        .blocking_pick_folder();
    Ok(folder.map(|p| p.to_string()))
}

#[tauri::command]
fn set_theme(theme: String, state: State<AppState>) -> Result<AppConfig, String> {
    let mut config = state.config.lock().map_err(|e| e.to_string())?;
    config.theme = theme;
    save_config(&config)?;
    Ok(config.clone())
}

#[tauri::command]
fn engine_command(
    command: String,
    args: Vec<String>,
    state: State<AppState>,
) -> Result<serde_json::Value, String> {
    let config = state.config.lock().map_err(|e| e.to_string())?;
    let vault = config
        .vault_path
        .as_ref()
        .ok_or_else(|| "No vault selected. Import a vault folder first.".to_string())?;
    state.engine.run(&command, &args, vault)
}

#[tauri::command]
fn read_vault_file(rel_path: String, state: State<AppState>) -> Result<String, String> {
    let config = state.config.lock().map_err(|e| e.to_string())?;
    let vault = config
        .vault_path
        .as_ref()
        .ok_or_else(|| "No vault selected".to_string())?;
    config::read_vault_file(vault, &rel_path)
}

#[tauri::command]
fn write_vault_file_cmd(
    rel_path: String,
    content: String,
    state: State<AppState>,
) -> Result<(), String> {
    let config = state.config.lock().map_err(|e| e.to_string())?;
    let vault = config
        .vault_path
        .as_ref()
        .ok_or_else(|| "No vault selected".to_string())?;
    write_vault_file(vault, &rel_path, &content)
}

#[tauri::command]
fn store_api_key(provider: String, key: String) -> Result<(), String> {
    secrets::store_api_key(&provider, &key)
}

#[tauri::command]
fn get_api_key(provider: String) -> Result<Option<String>, String> {
    secrets::get_api_key(&provider)
}

#[tauri::command]
fn set_crash_reports(enabled: bool) -> Result<(), String> {
    secrets::set_crash_reports(enabled)
}

#[tauri::command]
fn get_crash_reports() -> Result<bool, String> {
    secrets::crash_reports_enabled()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let config = load_config().unwrap_or_default();
    let engine = EngineService::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .manage(AppState {
            config: Mutex::new(config),
            engine,
        })
        .invoke_handler(tauri::generate_handler![
            get_config,
            set_vault_path,
            pick_vault_folder,
            set_theme,
            engine_command,
            read_vault_file,
            write_vault_file_cmd,
            store_api_key,
            get_api_key,
            set_crash_reports,
            get_crash_reports,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
