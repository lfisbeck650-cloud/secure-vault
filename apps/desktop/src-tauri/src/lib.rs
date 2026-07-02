use std::sync::Mutex;
use tauri::{Manager, State};

use vault_core::api::VaultApi;
use storage::models::Entry;
use utils::password_generator::PasswordOptions;

pub struct VaultState(pub Mutex<Option<VaultApi>>);

#[tauri::command]
fn get_vault_path(app: tauri::AppHandle) -> Result<String, String> {
    let data_dir = app.path().app_data_dir().map_err(|e| format!("Failed to get data dir: {}", e))?;
    std::fs::create_dir_all(&data_dir).map_err(|e| format!("Failed to create data dir: {}", e))?;
    Ok(data_dir.join("vault.json").to_string_lossy().to_string())
}

#[tauri::command]
fn create_vault(state: State<VaultState>, path: String, master_password: String) -> Result<(), String> {
    let mut api = VaultApi::new(std::path::PathBuf::from(&path));
    api.create_vault(&master_password)?;
    let mut guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    *guard = Some(api);
    Ok(())
}

#[tauri::command]
fn unlock_vault(state: State<VaultState>, path: String, master_password: String) -> Result<(), String> {
    let mut api = VaultApi::new(std::path::PathBuf::from(&path));
    api.unlock_vault(&master_password)?;
    let mut guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    *guard = Some(api);
    Ok(())
}

#[tauri::command]
fn lock_vault(state: State<VaultState>) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    if let Some(api) = guard.as_mut() {
        api.lock_vault();
    }
    *guard = None;
    Ok(())
}

#[tauri::command]
fn vault_exists(_state: State<VaultState>, path: String) -> Result<bool, String> {
    let api = VaultApi::new(std::path::PathBuf::from(&path));
    Ok(api.vault_exists())
}

#[tauri::command]
fn is_unlocked(state: State<VaultState>) -> Result<bool, String> {
    let guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    Ok(guard.as_ref().map(|a| a.is_unlocked()).unwrap_or(false))
}

#[tauri::command]
fn add_entry(state: State<VaultState>, title: String, username: String, password: String) -> Result<Entry, String> {
    let mut guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let api = guard.as_mut().ok_or_else(|| "Vault not initialized".to_string())?;
    api.add_entry(title, username, password)
}

#[tauri::command]
fn update_entry(
    state: State<VaultState>,
    id: String,
    title: String,
    username: String,
    password: Option<String>,
    url: Option<String>,
    notes: Option<String>,
) -> Result<Entry, String> {
    let mut guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let api = guard.as_mut().ok_or_else(|| "Vault not initialized".to_string())?;
    api.update_entry(id, title, username, password, url, notes)
}

#[tauri::command]
fn delete_entry(state: State<VaultState>, id: String) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let api = guard.as_mut().ok_or_else(|| "Vault not initialized".to_string())?;
    api.delete_entry(&id)
}

#[tauri::command]
fn get_entries(state: State<VaultState>) -> Result<Vec<Entry>, String> {
    let guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let api = guard.as_ref().ok_or_else(|| "Vault not initialized".to_string())?;
    api.get_entries()
}

#[tauri::command]
fn search_entries(state: State<VaultState>, query: String) -> Result<Vec<Entry>, String> {
    let guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let api = guard.as_ref().ok_or_else(|| "Vault not initialized".to_string())?;
    api.search_entries(&query)
}

#[tauri::command]
fn generate_password(
    length: usize,
    uppercase: bool,
    lowercase: bool,
    digits: bool,
    symbols: bool,
) -> Result<String, String> {
    let options = PasswordOptions {
        length,
        uppercase,
        lowercase,
        digits,
        symbols,
        exclude_ambiguous: false,
    };
    let api = VaultApi::new(std::path::PathBuf::new());
    api.generate_password(options)
}

#[tauri::command]
fn export_vault(state: State<VaultState>) -> Result<String, String> {
    let guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let api = guard.as_ref().ok_or_else(|| "Vault not initialized".to_string())?;
    api.export_vault()
}

#[tauri::command]
fn import_vault(state: State<VaultState>, data: String) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let api = guard.as_mut().ok_or_else(|| "Vault not initialized".to_string())?;
    api.import_vault(&data)
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .manage(VaultState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            get_vault_path,
            create_vault,
            unlock_vault,
            lock_vault,
            vault_exists,
            is_unlocked,
            add_entry,
            update_entry,
            delete_entry,
            get_entries,
            search_entries,
            generate_password,
            export_vault,
            import_vault,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
