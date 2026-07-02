use rand::Rng;

const UPPERCASE: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE: &[u8] = b"abcdefghijklmnopqrstuvwxyz";
const DIGITS: &[u8] = b"0123456789";
const SYMBOLS: &[u8] = b"!@#$%^&*()-_=+[]{}|;:,.<>?/~";

#[derive(Debug, Clone)]
pub struct PasswordOptions {
    pub length: usize,
    pub uppercase: bool,
    pub lowercase: bool,
    pub digits: bool,
    pub symbols: bool,
    pub exclude_ambiguous: bool,
}

impl Default for PasswordOptions {
    fn default() -> Self {
        Self {
            length: 24,
            uppercase: true,
            lowercase: true,
            digits: true,
            symbols: true,
            exclude_ambiguous: false,
        }
    }
}

pub fn generate_password(options: &PasswordOptions) -> Result<String, String> {
    let mut chars = Vec::new();
    let mut required = Vec::new();

    if options.uppercase {
        chars.extend_from_slice(UPPERCASE);
        required.push(choose_random(UPPERCASE)?);
    }
    if options.lowercase {
        chars.extend_from_slice(LOWERCASE);
        required.push(choose_random(LOWERCASE)?);
    }
    if options.digits {
        chars.extend_from_slice(DIGITS);
        required.push(choose_random(DIGITS)?);
    }
    if options.symbols {
        chars.extend_from_slice(SYMBOLS);
        required.push(choose_random(SYMBOLS)?);
    }

    if chars.is_empty() {
        return Err("At least one character type must be selected".to_string());
    }

    if options.length < required.len() {
        return Err(format!(
            "Password length too short for required character types. Minimum: {}",
            required.len()
        ));
    }

    let mut rng = rand::thread_rng();
    let mut password: Vec<u8> = Vec::with_capacity(options.length);

    for _ in 0..(options.length - required.len()) {
        let idx = rng.gen_range(0..chars.len());
        password.push(chars[idx]);
    }

    password.extend_from_slice(&required);
    shuffle(&mut password);

    String::from_utf8(password).map_err(|_| "Failed to generate password".to_string())
}

fn choose_random(charset: &[u8]) -> Result<u8, String> {
    let mut rng = rand::thread_rng();
    let idx = rng.gen_range(0..charset.len());
    Ok(charset[idx])
}

fn shuffle(data: &mut [u8]) {
    let mut rng = rand::thread_rng();
    let len = data.len();
    for i in (1..len).rev() {
        let j = rng.gen_range(0..=i);
        data.swap(i, j);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_default_length() {
        let options = PasswordOptions::default();
        let password = generate_password(&options).unwrap();
        assert_eq!(password.len(), 24);
    }

    #[test]
    fn test_generate_custom_length() {
        let options = PasswordOptions {
            length: 12,
            ..Default::default()
        };
        let password = generate_password(&options).unwrap();
        assert_eq!(password.len(), 12);
    }

    #[test]
    fn test_generate_only_digits() {
        let options = PasswordOptions {
            uppercase: false,
            lowercase: false,
            digits: true,
            symbols: false,
            ..Default::default()
        };
        let password = generate_password(&options).unwrap();
        assert!(password.chars().all(|c| c.is_ascii_digit()));
    }

    #[test]
    fn test_generate_no_types() {
        let options = PasswordOptions {
            uppercase: false,
            lowercase: false,
            digits: false,
            symbols: false,
            ..Default::default()
        };
        let result = generate_password(&options);
        assert!(result.is_err());
    }

    #[test]
    fn test_generate_too_short() {
        let options = PasswordOptions {
            length: 1,
            uppercase: true,
            lowercase: true,
            ..Default::default()
        };
        let result = generate_password(&options);
        assert!(result.is_err());
    }

    #[test]
    fn test_generate_unique() {
        let options = PasswordOptions::default();
        let p1 = generate_password(&options).unwrap();
        let p2 = generate_password(&options).unwrap();
        assert_ne!(p1, p2);
    }

    #[test]
    fn test_generate_includes_each_type() {
        let options = PasswordOptions {
            length: 8,
            uppercase: true,
            lowercase: true,
            digits: true,
            symbols: true,
            exclude_ambiguous: false,
        };
        let password = generate_password(&options).unwrap();
        assert!(password.chars().any(|c| c.is_ascii_uppercase()));
        assert!(password.chars().any(|c| c.is_ascii_lowercase()));
        assert!(password.chars().any(|c| c.is_ascii_digit()));
    }
}
