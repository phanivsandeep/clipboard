import { supabase } from './supabaseClient';
import { encryptData, decryptData } from './encryption';

export const fetchClipboard = async (userId, clipboardId, password) => {
  try {
    let query = supabase
      .from('clipboards')
      .select('id, encrypted_data')
      .eq('user_id', userId);
      
    if (clipboardId) {
      query = query.eq('id', clipboardId);
    } else {
      query = query.order('created_at', { ascending: false }).limit(1);
    }
    
    const { data, error } = await query.single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    if (!data) {
      return { success: false, message: 'No clipboard found' };
    }
    
    const decryptResult = decryptData(data.encrypted_data, password);
    
    if (!decryptResult.success) {
      return { success: false, message: 'Unable to decrypt clipboard data' };
    }
    
    return {
      success: true,
      data: decryptResult.data,
      clipboardId: data.id
    };
  } catch (error) {
    console.error('Error fetching clipboard:', error);
    return { success: false, message: 'Error fetching clipboard data' };
  }
};

export const saveClipboard = async (userId, textAreas, password, recordId = null) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('clipboard_users')
      .select('id, clipboard_count')
      .eq('id', userId)
      .single();
      
    if (userError) throw userError;
    
      if (userData.clipboard_count >= 2 && !recordId) {
      return {
        success: false,
        message: 'You\'ve reached the maximum limit of 2 clipboards.'
      };
    }
    
    const encryptedData = encryptData(textAreas, password);
    
    let response;
    
    if (recordId) {
      response = await supabase
        .from('clipboards')
        .update({
          encrypted_data: encryptedData,
          updated_at: new Date()
        })
        .eq('id', recordId);
    } else {
      response = await supabase
        .from('clipboards')
        .insert({
          user_id: userId,
          encrypted_data: encryptedData
        })
        .select();
        
      if (response.data && response.data[0]) {
        await supabase
          .from('clipboard_users')
          .update({
            clipboard_count: userData.clipboard_count + 1
          })
          .eq('id', userId);
      }
    }

    if (response.error) throw response.error;
    
    return {
      success: true,
      message: 'Clipboard saved successfully!',
      newRecordId: !recordId && response.data ? response.data[0].id : null,
      newCount: !recordId ? userData.clipboard_count + 1 : null
    };
  } catch (error) {
    console.error('Error saving clipboard:', error);
    return {
      success: false,
      message: 'Unable to save your clipboard. Please try again.'
    };
  }
};