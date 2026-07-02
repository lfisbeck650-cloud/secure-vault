use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use zeroize::Zeroizing;

const MEMORY_COST: u32 = 19456;
const TIME_COST: u32 = 2;
const PARALLELISM: u32 = 1;
const OUTPUT_LENGTH: usize = 32;

#[derive(Clone, Debug)]
pub struct KdfParams {
    pub memory_cost: u32,
    pub time_cost: u32,
    pub parallelism: u32,
    pub salt: String,
    pub output_length: usize,
}

impl Default for KdfParams {
    fn default() -> Self {
        Self {
            memory_cost: MEMORY_COST,
            time_cost: TIME_COST,
            parallelism: PARALLELISM,
            salt: String::new(),
            output_length: OUTPUT_LENGTH,
        }
    }
}

pub fn derive_key(password: &str, salt: &str) -> Result<Zeroizing<Vec<u8>>, String> {
    let salt_str = SaltString::from_b64(salt).map_err(|e| format!("Invalid salt: {}", e))?;
    let argon2 = Argon2::default();
    let mut key = vec![0u8; OUTPUT_LENGTH];
    let hash = argon2
        .hash_password(password.as_bytes(), &salt_str)
        .map_err(|e| format!("Key derivation failed: {}", e))?;
    let hash_bytes = hash.hash.unwrap();
    key.copy_from_slice(&hash_bytes.as_bytes()[..OUTPUT_LENGTH]);
    Ok(Zeroizing::new(key))
}

pub fn generate_salt() -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    Ok(salt.to_string())
}

pub fn verify_key(password: &str, hash: &str) -> Result<bool, String> {
    let parsed_hash =
        PasswordHash::new(hash).map_err(|e| format!("Invalid hash: {}", e))?;
    let argon2 = Argon2::default();
    Ok(argon2
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}
