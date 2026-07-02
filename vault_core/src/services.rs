use storage::models::{Entry, VaultData};
use storage::serializer::{
    deserialize_vault, deserialize_vault_from_string, serialize_vault, serialize_vault_string,
};
use storage::vault_file::VaultFile;

pub struct VaultService {
    vault_file: VaultFile,
    unlocked_data: Option<VaultData>,
    encryption_key: Option<Vec<u8>>,
    salt: Option<String>,
}

impl VaultService {
    pub fn new(vault_path: std::path::PathBuf) -> Self {
        Self {
            vault_file: VaultFile::new(vault_path),
            unlocked_data: None,
            encryption_key: None,
            salt: None,
        }
    }

    pub fn vault_exists(&self) -> bool {
        self.vault_file.exists()
    }

    pub fn is_unlocked(&self) -> bool {
        self.unlocked_data.is_some()
    }

    pub fn create_vault(&mut self, master_password: &str) -> Result<(), String> {
        if self.vault_file.exists() {
            return Err("Vault already exists".to_string());
        }
        let data = VaultData::new();
        let serialized = serialize_vault(&data)?;
        let (encrypted, key) = self.vault_file.create(&serialized, master_password)?;
        self.unlocked_data = Some(data);
        self.encryption_key = Some(key);
        self.salt = Some(encrypted.salt);
        Ok(())
    }

    pub fn unlock_vault(&mut self, master_password: &str) -> Result<(), String> {
        if !self.vault_file.exists() {
            return Err("Vault does not exist. Create it first.".to_string());
        }
        let (decrypted, key, salt) = self.vault_file.load_with_password(master_password)?;
        let data: VaultData = deserialize_vault(&decrypted)?;

        self.unlocked_data = Some(data);
        self.encryption_key = Some(key);
        self.salt = Some(salt);
        Ok(())
    }

    pub fn lock_vault(&mut self) {
        self.unlocked_data = None;
        self.encryption_key = None;
        self.salt = None;
    }

    fn save(&self) -> Result<(), String> {
        let data = self
            .unlocked_data
            .as_ref()
            .ok_or_else(|| "Vault is locked".to_string())?;
        let key = self
            .encryption_key
            .as_ref()
            .ok_or_else(|| "No encryption key".to_string())?;
        let salt = self
            .salt
            .as_ref()
            .ok_or_else(|| "No salt".to_string())?;
        let serialized = serialize_vault(data)?;
        self.vault_file.save_with_key(&serialized, key, salt)
    }

    pub fn add_entry(
        &mut self,
        title: String,
        username: String,
        password: String,
    ) -> Result<Entry, String> {
        let entry = Entry::new(title, username, password);
        let entry_clone = entry.clone();
        {
            let data = self
                .unlocked_data
                .as_mut()
                .ok_or_else(|| "Vault is locked".to_string())?;
            data.entries.push(entry);
            data.updated_at = chrono::Utc::now().to_rfc3339();
        }
        self.save()?;
        Ok(entry_clone)
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
        let entry_clone = {
            let data = self
                .unlocked_data
                .as_mut()
                .ok_or_else(|| "Vault is locked".to_string())?;
            let entry = data
                .entries
                .iter_mut()
                .find(|e| e.id == id)
                .ok_or_else(|| "Entry not found".to_string())?;
            entry.update(title, username, password, url, notes);
            data.updated_at = chrono::Utc::now().to_rfc3339();
            entry.clone()
        };
        self.save()?;
        Ok(entry_clone)
    }

    pub fn delete_entry(&mut self, id: &str) -> Result<(), String> {
        let found = {
            let data = self
                .unlocked_data
                .as_mut()
                .ok_or_else(|| "Vault is locked".to_string())?;
            let len_before = data.entries.len();
            data.entries.retain(|e| e.id != id);
            if data.entries.len() == len_before {
                false
            } else {
                data.updated_at = chrono::Utc::now().to_rfc3339();
                true
            }
        };
        if found {
            self.save()?;
            Ok(())
        } else {
            Err("Entry not found".to_string())
        }
    }

    pub fn get_entries(&self) -> Result<Vec<Entry>, String> {
        let data = self
            .unlocked_data
            .as_ref()
            .ok_or_else(|| "Vault is locked".to_string())?;
        Ok(data.entries.clone())
    }

    pub fn search_entries(&self, query: &str) -> Result<Vec<Entry>, String> {
        let data = self
            .unlocked_data
            .as_ref()
            .ok_or_else(|| "Vault is locked".to_string())?;
        let q = query.to_lowercase();
        Ok(data
            .entries
            .iter()
            .filter(|e| {
                e.title.to_lowercase().contains(&q)
                    || e.username.to_lowercase().contains(&q)
                    || e.url
                        .as_ref()
                        .is_some_and(|u| u.to_lowercase().contains(&q))
            })
            .cloned()
            .collect())
    }

    pub fn export_vault(&self) -> Result<String, String> {
        let data = self
            .unlocked_data
            .as_ref()
            .ok_or_else(|| "Vault is locked".to_string())?;
        serialize_vault_string(data)
    }

    pub fn import_vault(&mut self, data_str: &str) -> Result<(), String> {
        let imported: VaultData = deserialize_vault_from_string(data_str)?;
        {
            let data = self
                .unlocked_data
                .as_mut()
                .ok_or_else(|| "Vault is locked".to_string())?;
            data.entries = imported.entries;
            data.updated_at = chrono::Utc::now().to_rfc3339();
        }
        self.save()
    }

    pub fn get_vault_data(&self) -> Result<VaultData, String> {
        let data = self
            .unlocked_data
            .as_ref()
            .ok_or_else(|| "Vault is locked".to_string())?;
        Ok(data.clone())
    }

    pub fn set_user_name(&mut self, name: &str) -> Result<(), String> {
        let data = self
            .unlocked_data
            .as_mut()
            .ok_or_else(|| "Vault is locked".to_string())?;
        data.set_user_name(name.to_string());
        self.save()
    }

    pub fn get_user_name(&self) -> Result<String, String> {
        let data = self
            .unlocked_data
            .as_ref()
            .ok_or_else(|| "Vault is locked".to_string())?;
        Ok(data.user_name().to_string())
    }
}
