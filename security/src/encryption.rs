use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use rand::RngCore;
use zeroize::Zeroizing;

const NONCE_SIZE: usize = 12;

pub fn encrypt(data: &[u8], key: &[u8]) -> Result<(Vec<u8>, Vec<u8>), String> {
    let cipher =
        Aes256Gcm::new_from_slice(key).map_err(|e| format!("Invalid key length: {}", e))?;
    let mut nonce_bytes = vec![0u8; NONCE_SIZE];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, data)
        .map_err(|e| format!("Encryption failed: {}", e))?;
    Ok((ciphertext, nonce_bytes))
}

pub fn decrypt(ciphertext: &[u8], key: &[u8], nonce_bytes: &[u8]) -> Result<Zeroizing<Vec<u8>>, String> {
    let cipher =
        Aes256Gcm::new_from_slice(key).map_err(|e| format!("Invalid key length: {}", e))?;
    let nonce = Nonce::from_slice(nonce_bytes);
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| "Decryption failed: wrong password or corrupted data".to_string())?;
    Ok(Zeroizing::new(plaintext))
}

pub fn encrypt_to_string(data: &[u8], key: &[u8]) -> Result<String, String> {
    let (ciphertext, nonce) = encrypt(data, key)?;
    let mut combined = nonce.clone();
    combined.extend_from_slice(&ciphertext);
    Ok(BASE64.encode(&combined))
}

pub fn decrypt_from_string(encoded: &str, key: &[u8]) -> Result<Zeroizing<Vec<u8>>, String> {
    let combined = BASE64
        .decode(encoded)
        .map_err(|e| format!("Invalid base64: {}", e))?;
    if combined.len() < NONCE_SIZE {
        return Err("Invalid ciphertext".to_string());
    }
    let (nonce, ciphertext) = combined.split_at(NONCE_SIZE);
    decrypt(ciphertext, key, nonce)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::kdf::{derive_key, generate_salt};

    #[test]
    fn test_derive_key_deterministic() {
        let salt = generate_salt().unwrap();
        let key1 = derive_key("test_password", &salt).unwrap();
        let key2 = derive_key("test_password", &salt).unwrap();
        assert_eq!(key1, key2);
    }

    #[test]
    fn test_derive_key_different_passwords() {
        let salt = generate_salt().unwrap();
        let key1 = derive_key("password1", &salt).unwrap();
        let key2 = derive_key("password2", &salt).unwrap();
        assert_ne!(key1, key2);
    }

    #[test]
    fn test_encrypt_decrypt_roundtrip() {
        let key = derive_key("master", &generate_salt().unwrap()).unwrap();
        let data = b"Hello, Secure Vault!";
        let encrypted = encrypt_to_string(data, &key).unwrap();
        let decrypted = decrypt_from_string(&encrypted, &key).unwrap();
        assert_eq!(decrypted.as_slice(), data);
    }

    #[test]
    fn test_decrypt_wrong_key() {
        let key1 = derive_key("correct", &generate_salt().unwrap()).unwrap();
        let key2 = derive_key("wrong", &generate_salt().unwrap()).unwrap();
        let data = b"secret data";
        let encrypted = encrypt_to_string(data, &key1).unwrap();
        let result = decrypt_from_string(&encrypted, &key2);
        assert!(result.is_err());
    }

    #[test]
    fn test_encrypt_empty_data() {
        let key = derive_key("password", &generate_salt().unwrap()).unwrap();
        let data = b"";
        let encrypted = encrypt_to_string(data, &key).unwrap();
        let decrypted = decrypt_from_string(&encrypted, &key).unwrap();
        assert_eq!(decrypted.as_slice(), data);
    }
}
