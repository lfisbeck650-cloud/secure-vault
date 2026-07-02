use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entry {
    pub id: String,
    pub title: String,
    pub username: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub password: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl Entry {
    pub fn new(title: String, username: String, password: String) -> Self {
        let now = Utc::now().to_rfc3339();
        Self {
            id: Uuid::new_v4().to_string(),
            title,
            username,
            password: Some(password),
            url: None,
            notes: None,
            created_at: now.clone(),
            updated_at: now,
        }
    }

    pub fn update(&mut self, title: String, username: String, password: Option<String>, url: Option<String>, notes: Option<String>) {
        self.title = title;
        self.username = username;
        if password.is_some() {
            self.password = password;
        }
        self.url = url;
        self.notes = notes;
        self.updated_at = Utc::now().to_rfc3339();
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultData {
    pub entries: Vec<Entry>,
    pub user_name: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl VaultData {
    pub fn new() -> Self {
        let now = Utc::now().to_rfc3339();
        Self {
            entries: Vec::new(),
            user_name: None,
            created_at: now.clone(),
            updated_at: now,
        }
    }

    pub fn user_name(&self) -> &str {
        self.user_name.as_deref().unwrap_or("User")
    }

    pub fn set_user_name(&mut self, name: String) {
        self.user_name = Some(name);
        self.updated_at = Utc::now().to_rfc3339();
    }
}

impl Default for VaultData {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_entry_new() {
        let entry = Entry::new("Test".to_string(), "user".to_string(), "pass123".to_string());
        assert_eq!(entry.title, "Test");
        assert_eq!(entry.username, "user");
        assert_eq!(entry.password, Some("pass123".to_string()));
        assert!(entry.url.is_none());
        assert!(entry.notes.is_none());
    }

    #[test]
    fn test_entry_update() {
        let mut entry = Entry::new("Old".to_string(), "old_user".to_string(), "old_pass".to_string());
        entry.update(
            "New".to_string(),
            "new_user".to_string(),
            Some("new_pass".to_string()),
            Some("https://example.com".to_string()),
            Some("some notes".to_string()),
        );
        assert_eq!(entry.title, "New");
        assert_eq!(entry.username, "new_user");
        assert_eq!(entry.password, Some("new_pass".to_string()));
        assert_eq!(entry.url, Some("https://example.com".to_string()));
        assert_eq!(entry.notes, Some("some notes".to_string()));
    }

    #[test]
    fn test_vault_data_new() {
        let vault = VaultData::new();
        assert!(vault.entries.is_empty());
    }

    #[test]
    fn test_serialization_roundtrip() {
        let mut vault = VaultData::new();
        vault.entries.push(Entry::new("Test".to_string(), "user".to_string(), "pass".to_string()));

        let serialized = serde_json::to_vec(&vault).unwrap();
        let deserialized: VaultData = serde_json::from_slice(&serialized).unwrap();

        assert_eq!(deserialized.entries.len(), 1);
        assert_eq!(deserialized.entries[0].title, "Test");
    }
}
