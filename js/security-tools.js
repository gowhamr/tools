/* ===== security-tools.js – Password, Hash, JWT ===== */

const SecurityTools = (() => {

  /** Generate a secure random password */
  function generatePassword(length = 16, options = { upper: true, lower: true, number: true, symbol: true }) {
    const charset = {
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lower: 'abcdefghijklmnopqrstuvwxyz',
      number: '0123456789',
      symbol: '!@#$%^&*()_+~`|}{[]:;?><,./-='
    };
    
    let chars = '';
    if (options.upper) chars += charset.upper;
    if (options.lower) chars += charset.lower;
    if (options.number) chars += charset.number;
    if (options.symbol) chars += charset.symbol;
    
    if (!chars) return '';
    
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars[array[i] % chars.length];
    }
    return password;
  }

  /** Calculate password strength */
  function getPasswordStrength(password) {
    let score = 0;
    if (!password) return { score: 0, label: 'Empty', color: '#6b7280' };
    
    if (password.length > 8) score++;
    if (password.length > 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const levels = [
      { label: 'Very Weak', color: '#ef4444', pct: 20 },
      { label: 'Weak', color: '#f97316', pct: 40 },
      { label: 'Fair', color: '#eab308', pct: 60 },
      { label: 'Good', color: '#84cc16', pct: 80 },
      { label: 'Strong', color: '#22c55e', pct: 100 }
    ];
    
    const index = Math.min(Math.floor((score / 6) * levels.length), levels.length - 1);
    return { ...levels[index], score };
  }

  /** Generate SHA hashes using Web Crypto API */
  async function hashText(text, algorithm = 'SHA-256') {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await window.crypto.subtle.digest(algorithm, msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /** Decode JWT without validation */
  function decodeJWT(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format');
      
      const decode = (str) => {
        try {
          return JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')));
        } catch (e) {
          return null;
        }
      };
      
      return {
        header: decode(parts[0]),
        payload: decode(parts[1]),
        valid: true
      };
    } catch (e) {
      return { valid: false, error: e.message };
    }
  }

  return { generatePassword, getPasswordStrength, hashText, decodeJWT };
})();
