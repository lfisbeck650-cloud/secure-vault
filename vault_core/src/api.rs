use crate::services::VaultService;
use storage::models::{Entry, VaultData};
use utils::password_generator::{generate_password, PasswordOptions};

pub struct VaultApi {
    service: VaultService,
}

impl VaultApi {
    pub fn new(vault_path: std::path::PathBuf) -> Self {
        Self {
            service: VaultService::new(vault_path),
        }
    }

    pub fn create_vault(&mut self, master_password: &str) -> Result<(), String> {
        self.service.create_vault(master_password)
    }

    pub fn unlock_vault(&mut self, master_password: &str) -> Result<(), String> {
        self.service.unlock_vault(master_password)
    }

    pub fn lock_vault(&mut self) {
        self.service.lock_vault();
    }

    pub fn is_unlocked(&self) -> bool {
        self.service.is_unlocked()
    }

    pub fn vault_exists(&self) -> bool {
        self.service.vault_exists()
    }

    pub fn add_entry(&mut self, title: String, username: String, password: String) -> Result<Entry, String> {
        self.service.add_entry(title, username, password)
    }

    pub fn update_entry(
        &mut self,
        id: String,
        title: String,
        username: String,
        password: Option<String>,
        url: Option<String>,
        notes: Option<String>,
    ) -> Result<Entry, String> {
        self.service.update_entry(id, title, username, password, url, notes)
    }

    pub fn delete_entry(&mut self, id: &str) -> Result<(), String> {
        self.service.delete_entry(id)
    }

    pub fn get_entries(&self) -> Result<Vec<Entry>, String> {
        self.service.get_entries()
    }

    pub fn search_entries(&self, query: &str) -> Result<Vec<Entry>, String> {
        self.service.search_entries(query)
    }

    pub fn generate_password(&self, options: PasswordOptions) -> Result<String, String> {
        generate_password(&options)
    }

    pub fn export_vault(&self) -> Result<String, String> {
        self.service.export_vault()
    }

    pub fn import_vault(&mut self, data: &str) -> Result<(), String> {
        self.service.import_vault(data)
    }

    pub fn get_vault_data(&self) -> Result<VaultData, String> {
        self.service.get_vault_data()
    }

    pub fn set_user_name(&mut self, name: &str) -> Result<(), String> {
        self.service.set_user_name(name)
    }

    pub fn get_user_name(&self) -> Result<String, String> {
        self.service.get_user_name()
    }
}
