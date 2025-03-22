import React, { useState, useEffect, useCallback } from 'react';
import Header from '../Header';
import PasswordPrompt from '../PasswordPrompt';
import ClipboardContainer from './ClipboardContainer';
import StatusMessage from './StatusMessage';
import { supabase } from '../../utils/supabaseClient';
import { encryptData, decryptData } from '../../utils/encryption';
import { setCookie, getCookie, deleteCookie } from '../../utils/cookieUtils';
import { hashPassword } from '../../utils/authService';

const Clipboard = () => {
  const [textAreas, setTextAreas] = useState([{ id: Date.now(), content: '' }]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [recordId, setRecordId] = useState(null);
  const [clipboardCount, setClipboardCount] = useState(0);
  const [userId, setUserId] = useState(null);

  const handleSelectClipboard = async (clipboardId) => {
    if (clipboardId === recordId) return; 
    
    try {
      setStatus('Loading clipboard...');
      setStatusType('loading');
      
      const { data: clipboardData, error: clipboardError } = await supabase
        .from('clipboards')
        .select('id, encrypted_data')
        .eq('id', clipboardId)
        .single();
      
      if (clipboardError) throw clipboardError;
      
      if (clipboardData) {
        const result = decryptData(clipboardData.encrypted_data, password);
        
        if (result.success) {
          setTextAreas(result.data);
          setRecordId(clipboardData.id);
          setStatus('Clipboard loaded successfully!');
          setStatusType('success');
          setTimeout(() => {
            setStatus('');
            setStatusType('');
          }, 2000);
        } else {
          setStatus('Unable to decrypt clipboard data.');
          setStatusType('error');
        }
      }
    } catch (error) {
      console.error('Error loading clipboard:', error);
      setStatus('Failed to load clipboard. Please try again.');
      setStatusType('error');
    }
  };
  const createNewClipboard = () => {
    setTextAreas([{ id: Date.now(), content: '' }]);
    setRecordId(null);
    
    setStatus('New clipboard created! Save to keep your changes.');
    setStatusType('info');
    setTimeout(() => {
      setStatus('');
      setStatusType('');
    }, 4000);
  };


  const verifyPassword = useCallback(async (enteredUsername, enteredPassword) => {
    try {
      setStatus('Verifying your credentials...');
      setStatusType('loading');
      

      const { data: userData, error: userError } = await supabase
        .from('clipboard_users')
        .select('*')
        .eq('username', enteredUsername)
        .single();
      
      if (userError && userError.code === 'PGRST116') {
        setStatus('Account not found. Please check your username or create an account.');
        setStatusType('error');
        return;
      } else if (userError) {
        throw userError;
      }
      

      setUserId(userData.id);
      
      const passwordHash = hashPassword(enteredPassword);
      
      if (userData.password_hash !== passwordHash) {
        setStatus('Incorrect password. Please try again.');
        setStatusType('error');
        return;
      }
      

      if (userData.clipboard_count >= 2) {
        setClipboardCount(userData.clipboard_count);
      }
      

      const { data: clipboardData, error: clipboardError } = await supabase
        .from('clipboards')
        .select('id, encrypted_data')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (clipboardError && clipboardError.code !== 'PGRST116') {
        throw clipboardError;
      }
      
      if (clipboardData) {
        const result = decryptData(clipboardData.encrypted_data, enteredPassword);
        
        if (result.success) {
          setTextAreas(result.data);
          setRecordId(clipboardData.id);
        } else {
          setStatus('Unable to decrypt your clipboard. Please try again.');
          setStatusType('error');
          return;
        }
      }
      
      setUsername(enteredUsername);
      setPassword(enteredPassword);
      
      setStatus('Authentication successful! Loading your clipboard...');
      setStatusType('success');
      
      setCookie('clipboard_username', enteredUsername);
      setCookie('clipboard_password', enteredPassword);
      
      setTimeout(() => {
        setIsVerified(true);
        setStatus('');
        setStatusType('');
      }, 1000);
      
    } catch (error) {
      console.error('Error:', error);
      setStatus('We encountered an issue accessing your clipboard. Please try again later.');
      setStatusType('error');
    }
  }, []);

  
  useEffect(() => {
    const savedUsername = getCookie('clipboard_username');
    const savedPassword = getCookie('clipboard_password');
    
    if (savedUsername && savedPassword) {
      verifyPassword(savedUsername, savedPassword);
    }
  }, [verifyPassword]);

  const refreshClipboard = async () => {
    if (!isVerified || !username || !password) return;
    
    try {
      setStatus('Refreshing your clipboard...');
      setStatusType('loading');
      
  
      const { data: userData, error: userError } = await supabase
        .from('clipboard_users')
        .select('id')
        .eq('username', username)
        .single();
        
      if (userError) throw userError;
      
  
      const { data: clipboardData, error: clipboardError } = await supabase
        .from('clipboards')
        .select('id, encrypted_data')
        .eq('user_id', userData.id)
        .eq('id', recordId)
        .single();
      
      if (clipboardError) throw clipboardError;
      
      if (clipboardData) {
  
        const result = decryptData(clipboardData.encrypted_data, password);
        
        if (result.success) {
          setTextAreas(result.data);
          setRecordId(clipboardData.id);
          setStatus('Clipboard refreshed successfully!');
          setStatusType('success');
          setTimeout(() => {
            setStatus('');
            setStatusType('');
          }, 3000);
        } else {
          setStatus('Unable to decrypt your clipboard data.');
          setStatusType('error');
        }
      } else {
        setStatus('No clipboard data found.');
        setStatusType('info');
        setTimeout(() => {
          setStatus('');
          setStatusType('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error refreshing clipboard:', error);
      setStatus('Unable to refresh your clipboard. Please try again.');
      setStatusType('error');
    }
  };
  const handleTextChange = (index, newContent) => {
    const updatedTextAreas = [...textAreas];
    updatedTextAreas[index].content = newContent;
    setTextAreas(updatedTextAreas);
  };

  const addTextArea = () => {
    if (textAreas.length < 4) {
      setTextAreas([...textAreas, { id: Date.now(), content: '' }]);
    }
  };


  const removeTextArea = (index) => {
    const updatedTextAreas = textAreas.filter((_, i) => i !== index);
    setTextAreas(updatedTextAreas);
  };


  const handleLogout = () => {
    setIsVerified(false);
    setUsername('');
    setPassword('');
    setTextAreas([{ id: Date.now(), content: '' }]);
    setRecordId(null);
    setUserId(null);
  };


  const saveToDatabase = async () => {
    if (!isVerified || !username || !password) return;
    
    try {
      setStatus('Saving your clipboard...');
      setStatusType('loading');
      

      const { data: userData, error: userError } = await supabase
        .from('clipboard_users')
        .select('id, clipboard_count')
        .eq('username', username)
        .single();
        
      if (userError) throw userError;
      

      if (userData.clipboard_count >= 2 && !recordId) {
        setStatus('You\'ve reached the maximum limit of 2 clipboards.');
        setStatusType('error');
        return;
      }
      
      const encryptedData = encryptData(textAreas, password);
      
      let clipboardResponse;
      
      if (recordId) {
        clipboardResponse = await supabase
          .from('clipboards')
          .update({
            encrypted_data: encryptedData,
            updated_at: new Date()
          })
          .eq('id', recordId);
      } else {
        clipboardResponse = await supabase
          .from('clipboards')
          .insert({
            user_id: userData.id,
            encrypted_data: encryptedData
          })
          .select();
          
        if (clipboardResponse.data && clipboardResponse.data[0]) {
          setRecordId(clipboardResponse.data[0].id);
          
          await supabase
            .from('clipboard_users')
            .update({
              clipboard_count: userData.clipboard_count + 1
            })
            .eq('id', userData.id);
            
          setClipboardCount(userData.clipboard_count + 1);
        }
      }

      if (clipboardResponse.error) throw clipboardResponse.error;
      
      setStatus('Clipboard saved successfully!');
      setStatusType('success');
      setTimeout(() => {
        setStatus('');
        setStatusType('');
      }, 3000);
      
    } catch (error) {
      console.error('Error saving:', error);
      setStatus('Unable to save your clipboard. Please try again.');
      setStatusType('error');
    }
  };

  const clearAll = () => {
    setTextAreas(textAreas.map(area => ({ ...area, content: '' })));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
     <Header 
  username={username} 
  onLogout={handleLogout} 
  onRefresh={refreshClipboard}
  selectedClipboardId={recordId}
  onSelectClipboard={handleSelectClipboard}
  onCreateNewClipboard={createNewClipboard}
  clipboardCount={clipboardCount}
/>
      
      <div className="container mx-auto py-8 px-4">
        {!isVerified ? (
          <div className="py-10">
            <PasswordPrompt onVerify={verifyPassword} isVerified={isVerified} />
            {status && (
              <div className="mt-4 max-w-md mx-auto">
                <StatusMessage status={status} type={statusType} />
              </div>
            )}
          </div>
        ) : (
          <ClipboardContainer
            textAreas={textAreas}
            handleTextChange={handleTextChange}
            removeTextArea={removeTextArea}
            clipboardCount={clipboardCount}
            recordId={recordId}
            status={status}
            statusType={statusType}
            addTextArea={addTextArea}
            saveToDatabase={saveToDatabase}
            clearAll={clearAll}
          />
        )}
      </div>
    </div>
  );
};

export default Clipboard;