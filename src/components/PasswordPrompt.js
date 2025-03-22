import React, { useState } from 'react';
import SignupForm from './SignupForm';

const PasswordPrompt = ({ onVerify, isVerified }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [isEmailLogin, setIsEmailLogin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(`Please enter a ${isEmailLogin ? 'email' : 'username'}`);
      return;
    }
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    try {
      setError('');
      onVerify(identifier, password, isEmailLogin);
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Failed to log in. Please check your credentials and try again.');
    }
  };

  const handleSignupSuccess = () => {
    setShowSignup(false);
    setIsEmailLogin(true);
  };

  if (isVerified) return null;

  if (showSignup) {
    return (
      <SignupForm 
        onCancel={() => setShowSignup(false)} 
        onSuccess={handleSignupSuccess} 
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-center text-indigo-700 dark:text-indigo-400 mb-6">Access Your Clipboard</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 flex justify-between items-center">
          <label htmlFor="identifier" className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
            {isEmailLogin ? 'Email' : 'Username'}
          </label>
          
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${!isEmailLogin ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>Username</span>
            
            {/* Toggle Switch */}
            <div className="relative inline-flex items-center cursor-pointer" onClick={() => setIsEmailLogin(!isEmailLogin)}>
              <div className={`w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${isEmailLogin ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <div 
                  className={`absolute top-0.5 left-0.5 bg-white dark:bg-gray-200 w-4 h-4 rounded-full shadow transform transition-transform duration-200 ease-in-out ${
                    isEmailLogin ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </div>
            </div>
            
            <span className={`text-xs ${isEmailLogin ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>Email</span>
          </div>
        </div>
        
        <div className="mb-4">
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={`Enter your ${isEmailLogin ? 'email' : 'username'}`}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            placeholder="Enter your password"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>}
        <button 
          type="submit" 
          className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 mb-4"
        >
          Access Clipboard
        </button>
        
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowSignup(true)}
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordPrompt;