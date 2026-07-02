use security::encryption::{decrypt_from_string, encrypt_to_string};
use security::kdf::{derive_key, generate_salt};
use zeroize::Zeroizing;

pub struct VaultFile {
    path: std::path::PathBuf,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct EncryptedVault {
    pub salt: String,
    pub ciphertext: String,
    pub kdf_memory_cost: u32,
    pub kdf_time_cost: u32,
    pub kdf_parallelism: u32,
}

impl VaultFile {
    pub fn new(path: std::path::PathBuf) -> Self {
        Self { path }
    }

    pub fn path(&self) -> &std::path::Path {
        &self.path
    }

    pub fn exists(&self) -> bool {
        self.path.exists()
    }

    pub fn create(&self, data: &[u8], password: &str) -> Result<(EncryptedVault, Vec<u8>), String> {
        let salt = generate_salt()?;
        let key = derive_key(password, &salt)?;
        let ciphertext = encrypt_to_string(data, &key)?;

        let encrypted = EncryptedVault {
            salt,
            ciphertext,
            kdf_memory_cost: 19456,
            kdf_time_cost: 2,
            kdf_parallelism: 1,
        };

        let json = serde_json::to_string_pretty(&encrypted)
            .map_err(|e| format!("Serialization failed: {}", e))?;
        std::fs::write(&self.path, json).map_err(|e| format!("Write failed: {}", e))?;
        Ok((encrypted, key.to_vec()))
    }

    pub fn save_with_key(&self, data: &[u8], key: &[u8], salt: &str) -> Result<(), String> {
        let ciphertext = encrypt_to_string(data, key)?;
        let encrypted = EncryptedVault {
            salt: salt.to_string(),
            ciphertext,
            kdf_memory_cost: 19456,
            kdf_time_cost: 2,
            kdf_parallelism: 1,
        };
        let json = serde_json::to_string_pretty(&encrypted)
            .map_err(|e| format!("Serialization failed: {}", e))?;
        std::fs::write(&self.path, json).map_err(|e| format!("Write failed: {}", e))?;
        Ok(())
    }

    pub fn load_with_password(&self, password: &str) -> Result<(Zeroizing<Vec<u8>>, Vec<u8>, String), String> {
        let json =
            std::fs::read_to_string(&self.path).map_err(|e| format!("Read failed: {}", e))?;
        let encrypted: EncryptedVault =
            serde_json::from_str(&json).map_err(|e| format!("Deserialization failed: {}", e))?;

        let key = derive_key(password, &encrypted.salt)?;
        let data = decrypt_from_string(&encrypted.ciphertext, &key)?;
        Ok((data, key.to_vec(), encrypted.salt))
    }

    pub fn delete(&self) -> Result<(), String> {
        if self.exists() {
            std::fs::remove_file(&self.path).map_err(|e| format!("Delete failed: {}", e))?;
        }
        Ok(())
    }
}
