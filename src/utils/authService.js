import { supabase } from './supabaseClient';
import CryptoJS from 'crypto-js';
import { setCookie } from './cookieUtils';

export const hashPassword = (pwd) => {
  return CryptoJS.SHA256(pwd).toString();
};

export const verifyCredentials = async (identifier, password, isHashed, isEmailLogin) => {
  try {
    const column = isEmailLogin ? 'email' : 'username';
    
    console.log(`Authenticating with ${column}: ${identifier}`);
    
    const { data: userExists, error: existsError } = await supabase
      .from('clipboard_users')
      .select('id')
      .eq(column, identifier)
      .single();
    
    if (existsError) {
      console.log('User lookup error:', existsError);
      if (existsError.code === 'PGRST116') {
        return { success: false, message: `Account not found...`, type: 'error' };
      }
      throw existsError;
    }
    
    const passwordHash = isHashed ? password : hashPassword(password);
    
    const { data: userData, error: authError } = await supabase
      .from('clipboard_users')
      .select('id, username, clipboard_count')
      .eq(column, identifier)
      .eq('password_hash', passwordHash)
      .single();
    
    if (authError || !userData) {
      console.log('Auth error:', authError);
      return { success: false, message: 'Incorrect password...', type: 'error' };
    }
    
    setCookie('clipboard_identifier', identifier);
    setCookie('clipboard_password_hash', passwordHash);
    setCookie('clipboard_is_hashed', 'true');
    setCookie('clipboard_login_type', isEmailLogin ? 'email' : 'username');
    
    return {
      success: true,
      message: 'Authentication successful!',
      type: 'success',
      userData,
      passwordHash
    };
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return { success: false, message: 'Error accessing clipboard...', type: 'error' };
  }
};