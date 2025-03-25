import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import CryptoJS from 'crypto-js';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

const SignupForm = ({ onCancel, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false,
  });

  const passwordRegex = {
    minLength: /.{5,}/,
    hasLowercase: /[a-z]/,
    hasNumber: /[0-9]/,
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/,
  };

  useEffect(() => {
    setPasswordValidation({
      minLength: passwordRegex.minLength.test(password),
      hasLowercase: passwordRegex.hasLowercase.test(password),
      hasNumber: passwordRegex.hasNumber.test(password),
      hasSymbol: passwordRegex.hasSymbol.test(password),
    });
  }, [password]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !username) {
      setError('Please fill in all fields');
      return;
    }

    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const { data: existingUser, error: usernameError } = await supabase
        .from('clipboard_users')
        .select('username')
        .eq('username', username)
        .single();
        
      if (existingUser) {
        setError('This username is already taken. Please choose another one.');
        setLoading(false);
        return;
      }
      
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });
      
      if (signupError) {
        if (signupError.message.includes('email') || signupError.message.includes('already registered')) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        throw signupError;
      }
      
      const { error: dbError } = await supabase
        .from('clipboard_users')
        .insert({
          username: username,
          password_hash: CryptoJS.SHA256(password).toString(),
          email: email,
          clipboard_count: 0,
          auth_id: data.user.id
        });
        
      if (dbError) {
        if (dbError.message.includes('clipboard_users_username_key')) {
          throw new Error('This username is already taken. Please choose another one.');
        } else if (dbError.message.includes('clipboard_users_email_key')) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        throw dbError;
      }
      
      setSuccessMessage('Account created! Please check your email for verification link.');
      setTimeout(() => {
        onSuccess();
      }, 5000);
      
    } catch (error) {
      console.error('Error signing up:', error);
      if (error.message.includes('username') && error.message.includes('taken')) {
        setError('This username is already taken. Please choose another one.');
      } else if (error.message.includes('email') && error.message.includes('registered')) {
        setError(
          <div>
            This email is already registered. 
            <button 
              onClick={onCancel} 
              className="ml-2 text-indigo-600 dark:text-indigo-400 underline font-medium"
            >
              Sign in instead
            </button>
          </div>
        );
      } else {
        setError('An error occurred during signup. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-indigo-700 dark:text-indigo-400 mb-6">Create Account</h2>
      
      {successMessage ? (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-md mb-4">
          {successMessage}
        </div>
      ) : (
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          <div className="mb-2">
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          {/* Password requirements display */}
          <div className="mb-4 text-sm">
            <p className="text-gray-700 dark:text-gray-300 mb-1">Password requirements:</p>
            <ul className="space-y-1 text-xs">
              <li className={`flex items-center ${passwordValidation.minLength ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <span className="mr-1">{passwordValidation.minLength ? '✓' : '○'}</span> 
                Minimum 5 characters
              </li>
              <li className={`flex items-center ${passwordValidation.hasLowercase ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <span className="mr-1">{passwordValidation.hasLowercase ? '✓' : '○'}</span> 
                At least 1 lowercase letter
              </li>
              <li className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <span className="mr-1">{passwordValidation.hasNumber ? '✓' : '○'}</span> 
                At least 1 number
              </li>
              <li className={`flex items-center ${passwordValidation.hasSymbol ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <span className="mr-1">{passwordValidation.hasSymbol ? '✓' : '○'}</span> 
                At least 1 special character (!@#$%^&*)
              </li>
            </ul>
          </div>
          
          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm mb-4">
              {error}
            </div>
          )}
          
          <div className="flex gap-3">
            <button 
              type="submit" 
              className={`w-full ${isPasswordValid ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600' : 'bg-indigo-400 dark:bg-indigo-500 cursor-not-allowed'} text-white font-medium py-2 px-4 rounded-md transition-colors duration-200`}
              disabled={loading || !isPasswordValid}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
            <button 
              type="button" 
              onClick={onCancel}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors duration-200"
              disabled={loading}
            >
              Go back
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SignupForm;