import React, { useState, useEffect, useCallback } from 'react';
import Header from '../Header';
import PasswordPrompt from '../PasswordPrompt';
import ClipboardContainer from './ClipboardContainer';
import StatusMessage from './StatusMessage';
import { getCookie, deleteCookie } from '../../utils/cookieUtils';
import { verifyCredentials } from '../../utils/authService';
import { fetchClipboard, saveClipboard } from '../../utils/clipboardService';

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

  const showStatus = (message, type, duration = 3000) => {
    setStatus(message);
    setStatusType(type);
    if (duration > 0) {
      setTimeout(() => {
        setStatus('');
        setStatusType('');
      }, duration);
    }
  };

  const handleSelectClipboard = async (clipboardId) => {
    if (clipboardId === recordId) return; 
    
    try {
      showStatus('Loading clipboard...', 'loading', 0);
      
      const result = await fetchClipboard(userId, clipboardId, password);
      
      if (result.success) {
        setTextAreas(result.data);
        setRecordId(clipboardId);
        showStatus('Clipboard loaded successfully!', 'success');
      } else {
        showStatus(result.message, 'error');
      }
    } catch (error) {
      console.error('Error loading clipboard:', error);
      showStatus('Failed to load clipboard. Please try again.', 'error');
    }
  };

  const createNewClipboard = () => {
    setTextAreas([{ id: Date.now(), content: '' }]);
    setRecordId(null);
    showStatus('New clipboard created! Save to keep your changes.', 'info', 4000);
  };

const verifyPassword = useCallback(async (identifier, enteredPassword, isHashed = false, isEmailLogin = false) => {
  try {
    showStatus('Verifying your credentials...', 'loading', 0);
    const result = await verifyCredentials(identifier, enteredPassword, isHashed, isEmailLogin);
    
    if (result.success) {
      const userData = result.userData;
      setUserId(userData.id);
      setUsername(userData.username);
      const decryptionPassword = isHashed ? enteredPassword : result.originalPassword || enteredPassword;
      setPassword(decryptionPassword);
      
      if (userData.clipboard_count >= 2) {
        setClipboardCount(userData.clipboard_count);
      }
      
      const clipboardResult = await fetchClipboard(userData.id, null, decryptionPassword);
      
      if (clipboardResult.success) {
        setTextAreas(clipboardResult.data);
        setRecordId(clipboardResult.clipboardId);
        showStatus('Authentication successful!', 'success');
        
        setTimeout(() => {
          setIsVerified(true);
          setStatus('');
          setStatusType('');
        }, 1000);
      } else {
        if (isHashed) {
          showStatus('Please enter your password again to decrypt your clipboard', 'info');
        } else {
          showStatus('Unable to decrypt your clipboard. Please try again.', 'error');
        }
      }
    } else {
      showStatus(result.message, result.type, 0);
    }
  } catch (error) {
    console.error('Error:', error);
    showStatus('We encountered an issue accessing your clipboard. Please try again.', 'error');
  }
}, []);

// Update useEffect
useEffect(() => {
  const savedIdentifier = getCookie('clipboard_identifier');
  const passwordHash = getCookie('clipboard_password_hash');
  const originalPassword = getCookie('clipboard_original_password');
  const isHashed = getCookie('clipboard_is_hashed') === 'true';
  const loginType = getCookie('clipboard_login_type');
  
  const passwordToUse = originalPassword || passwordHash;
  
  if (savedIdentifier && passwordToUse) {
    verifyPassword(savedIdentifier, passwordToUse, isHashed, loginType === 'email');
  }
}, [verifyPassword]);


  const refreshClipboard = async () => {
    if (!isVerified || !username || !password || !userId) return;
    
    try {
      showStatus('Refreshing your clipboard...', 'loading', 0);
      
      const result = await fetchClipboard(userId, recordId, password);
      
      if (result.success) {
        setTextAreas(result.data);
        showStatus('Clipboard refreshed successfully!', 'success');
      } else {
        showStatus(result.message || 'No clipboard data found.', result.message ? 'error' : 'info');
      }
    } catch (error) {
      console.error('Error refreshing clipboard:', error);
      showStatus('Unable to refresh your clipboard. Please try again.', 'error');
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
    deleteCookie('clipboard_identifier');
    deleteCookie('clipboard_password');
    deleteCookie('clipboard_is_hashed');
    deleteCookie('clipboard_login_type');
  };

  const saveToDatabase = async () => {
    if (!isVerified || !username || !password || !userId) return;
    
    try {
      showStatus('Saving your clipboard...', 'loading', 0);
      
      const result = await saveClipboard(userId, textAreas, password, recordId);
      
      if (result.success) {
        if (result.newRecordId) {
          setRecordId(result.newRecordId);
        }
        
        if (result.newCount) {
          setClipboardCount(result.newCount);
        }
        
        showStatus('Clipboard saved successfully!', 'success');
      } else {
        showStatus(result.message, 'error');
      }
    } catch (error) {
      console.error('Error saving:', error);
      showStatus('Unable to save your clipboard. Please try again.', 'error');
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