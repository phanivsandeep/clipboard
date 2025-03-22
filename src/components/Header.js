import React, { useState, useEffect } from 'react';
import { deleteCookie } from '../utils/cookieUtils';
import ThemeToggle from './ThemeToggle';
import { supabase } from '../utils/supabaseClient';

const Header = ({ username, onLogout, onRefresh, selectedClipboardId, onSelectClipboard, onCreateNewClipboard, clipboardCount }) => {
  const [clipboards, setClipboards] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  useEffect(() => {
    if (username) {
      fetchUserClipboards();
    }
  }, [username, selectedClipboardId]);
  
  const fetchUserClipboards = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('clipboard_users')
        .select('id')
        .eq('username', username)
        .single();
        
      if (userError) throw userError;
      
      const { data: clipboardsData, error: clipboardsError } = await supabase
        .from('clipboards')
        .select('id, created_at')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });
        
      if (clipboardsError) throw clipboardsError;
      
      setClipboards(clipboardsData || []);
    } catch (error) {
      console.error('Error fetching clipboards:', error);
    }
  };
  
  const handleLogout = () => {
    deleteCookie('clipboard_username');
    deleteCookie('clipboard_password');
    onLogout();
  };
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const handleSelectClipboard = (id) => {
    onSelectClipboard(id);
    setIsDropdownOpen(false);
  };
  
  const handleCreateNew = () => {
    onCreateNewClipboard();
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-indigo-600 dark:bg-indigo-800 text-white py-4 px-6 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">Universal Clipboard</h1>
        {username && (
          <span className="ml-4 bg-indigo-500 dark:bg-indigo-700 px-3 py-1 rounded-full text-sm hidden md:inline">
            {username}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        {username && (
          <>
            {/* Clipboard Manager Dropdown */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="bg-indigo-500 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="hidden sm:inline">My Clipboards</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                      Manage Clipboards
                    </div>
                    
                    {clipboards.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
                        No clipboards yet
                      </div>
                    ) : (
                      <ul>
                        {clipboards.map((clipboard, index) => (
                          <li key={clipboard.id}>
                            <button
                              onClick={() => handleSelectClipboard(clipboard.id)}
                              className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center ${
                                selectedClipboardId === clipboard.id
                                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Clipboard {index + 1}
                              </div>
                              {selectedClipboardId === clipboard.id && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {clipboardCount < 2 && (
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={handleCreateNew}
                          className="w-full text-left px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Create New Clipboard
                          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                            ({clipboardCount}/2)
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={onRefresh}
              className="bg-indigo-500 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden md:inline">Refresh</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="bg-indigo-500 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              <span className="hidden md:inline">Logout</span>
              <span className="inline md:hidden">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;