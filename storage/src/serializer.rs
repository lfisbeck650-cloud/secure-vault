use crate::models::VaultData;

pub fn serialize_vault(data: &VaultData) -> Result<Vec<u8>, String> {
    serde_json::to_vec(data).map_err(|e| format!("Serialization failed: {}", e))
}

pub fn deserialize_vault(data: &[u8]) -> Result<VaultData, String> {
    serde_json::from_slice(data).map_err(|e| format!("Deserialization failed: {}", e))
}

pub fn serialize_vault_string(data: &VaultData) -> Result<String, String> {
    serde_json::to_string_pretty(data).map_err(|e| format!("Serialization failed: {}", e))
}

pub fn deserialize_vault_from_string(data: &str) -> Result<VaultData, String> {
    serde_json::from_str(data).map_err(|e| format!("Deserialization failed: {}", e))
}
