import React, { useState } from 'react';
import SignupForm from './SignupForm';

const PasswordPrompt = ({ onVerify, isVerified }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

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

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
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