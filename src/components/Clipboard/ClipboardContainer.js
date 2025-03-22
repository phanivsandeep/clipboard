import React from 'react';
import TextArea from '../TextArea';
import StatusMessage from './StatusMessage';
import LimitWarning from './LimitWarning';

const ClipboardContainer = ({
  textAreas,
  handleTextChange,
  removeTextArea,
  clipboardCount,
  recordId,
  status,
  statusType,
  addTextArea,
  saveToDatabase,
  clearAll
}) => {
  const showLimitWarning = clipboardCount >= 2 && !recordId;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
      {showLimitWarning && <LimitWarning />}
      
      {status && <StatusMessage status={status} type={statusType} />}
      
      <div className="mb-6">
        {textAreas.map((area, index) => (
          <TextArea
            key={area.id}
            value={area.content}
            onChange={handleTextChange}
            index={index}
            onRemove={removeTextArea}
            canRemove={textAreas.length > 1}
          />
        ))}
      </div>
      
      <div className="flex flex-wrap gap-2 md:gap-3">
        {textAreas.length < 4 && (
          <button 
            onClick={addTextArea} 
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white text-gray-800 font-medium py-2 px-3 md:px-4 text-sm md:text-base rounded-md transition-colors duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">Add Text Area</span>
            <span className="inline sm:hidden">Add</span>
          </button>
        )}
        
        <button 
          onClick={saveToDatabase}
          disabled={showLimitWarning}
          className={`${
            showLimitWarning 
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600'
          } text-white font-medium py-2 px-3 md:px-4 text-sm md:text-base rounded-md transition-colors duration-200 flex items-center`}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save
        </button>
        
        <button 
          onClick={clearAll} 
          className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium py-2 px-3 md:px-4 text-sm md:text-base rounded-md transition-colors duration-200 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
      </div>
    </div>
  );
};

export default ClipboardContainer;