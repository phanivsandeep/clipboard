import { supabase } from '../utils/supabaseClient';
import CryptoJS from 'crypto-js';

export const hashPassword = (pwd) => {
  return CryptoJS.SHA256(pwd).toString();
};

export const verifyUser = async (identifier, password, isEmailLogin) => {
  let userData;
  let userError;

  if (isEmailLogin) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (error) {
      return { success: false, message: 'Incorrect email or password. Please try again.' };
    }

    const { data: user, error: userErr } = await supabase
      .from('clipboard_users')
      .select('*')
      .eq('auth_id', data.user.id)
      .single();

    userData = user;
    userError = userErr;
  } else {
    const { data, error } = await supabase
      .from('clipboard_users')
      .select('*')
      .eq('username', identifier)
      .single();

    userData = data;
    userError = error;

    if (userError && userError.code === 'PGRST116') {
      return { success: false, message: 'Account not found. Please check your username or create an account.' };
    } else if (userError) {
      throw userError;
    }

    const passwordHash = hashPassword(password);

    if (userData.password_hash !== passwordHash) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }
  }

  return { success: true, userData };
};

export const fetchClipboardData = async (userId, password) => {
  const { data: clipboardData, error: clipboardError } = await supabase
    .from('clipboards')
    .select('id, encrypted_data')
    .eq('user_id', userId)
    .single();

  if (clipboardError && clipboardError.code !== 'PGRST116') {
    throw clipboardError;
  }

  return clipboardData;
};