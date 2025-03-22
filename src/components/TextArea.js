import React, { useState } from 'react';

const TextArea = ({ value, onChange, index, onRemove, canRemove }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  return (
    <div className="relative mb-4">
      <div className="absolute top-2 right-2 flex space-x-1 md:space-x-2 z-10">
        <button
          onClick={handleCopy}
          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white text-gray-800 rounded-md px-2 py-1 text-xs flex items-center"
          title="Copy to clipboard"
        >
          {isCopied ? (
            <>
              <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
        
        {canRemove && (
          <button 
            onClick={() => onRemove(index)}
            className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-md px-2 py-1 text-xs flex items-center"
            aria-label="Remove this text area"
          >
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
        placeholder={`Clipboard area ${index + 1}`}
        className="w-full p-3 md:p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 min-h-[150px] resize-y pr-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
    </div>
  );
};

export default TextArea;