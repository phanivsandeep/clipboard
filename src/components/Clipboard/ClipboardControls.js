import React from 'react';

const ClipboardControls = ({ textAreasCount, onAddTextArea, onSave, onClear, isDisabled }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {textAreasCount < 4 && (
        <button 
          onClick={onAddTextArea} 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Text Area
        </button>
      )}
      
      <button 
        onClick={onSave}
        disabled={isDisabled}
        className={`${
          isDisabled
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center`}
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Save
      </button>
      
      <button 
        onClick={onClear} 
        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Clear All
      </button>
    </div>
  );
};

export default ClipboardControls;