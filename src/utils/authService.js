import { supabase } from './supabaseClient';
import CryptoJS from 'crypto-js';
import { setCookie } from './cookieUtils';

export const hashPassword = (pwd) => {
  return CryptoJS.SHA256(pwd).toString();
};

export const verifyCredentials = async (identifier, password, isHashed, isEmailLogin) => {
  try {
    const { data: userExists, error: existsError } = await supabase
      .from('clipboard_users')
      .select('id')
      .eq(isEmailLogin ? 'email' : 'username', identifier)
      .single();
    
    if (existsError && existsError.code === 'PGRST116') {
      return { success: false, message: `Account not found...`, type: 'error' };
    }
    
    const passwordHash = isHashed ? password : hashPassword(password);
    const { data: userData, error: authError } = await supabase
      .from('clipboard_users')
      .select('id, username, clipboard_count')
      .eq(isEmailLogin ? 'email' : 'username', identifier)
      .eq('password_hash', passwordHash)
      .single();
    
    if (authError || !userData) {
      return { success: false, message: 'Incorrect password...', type: 'error' };
    }
    
    const originalPassword = isHashed ? null : password;
    setCookie('clipboard_identifier', identifier);
    setCookie('clipboard_original_password', originalPassword); 
    setCookie('clipboard_password_hash', passwordHash); 
    setCookie('clipboard_is_hashed', isHashed ? 'true' : 'false');
    setCookie('clipboard_login_type', isEmailLogin ? 'email' : 'username');
    
    return {
      success: true,
      message: 'Authentication successful! Loading your clipboard...',
      type: 'success',
      userData,
      originalPassword,
      passwordHash
    };
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return { success: false, message: 'Error accessing clipboard...', type: 'error' };
  }
};