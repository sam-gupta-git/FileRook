import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Upload from './Upload';
import './MyFiles.css';

function MyFiles() {
  const [files, setFiles] = useState([]);
  const [expandedFile, setExpandedFile] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // New state for view mode

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/s3-files');
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    return imageExtensions.includes(extension) ? 'image' : 'document';
  };

  const toggleExpand = (fileKey) => {
    setExpandedFile(expandedFile === fileKey ? null : fileKey);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  return (
    <div className="my-files-container">
      <h1>My Files</h1>
      <div className={`file-container ${viewMode}`}>
        {viewMode === 'list' && (
          <div className="file-item file-header">
            <div className="file-icon"></div>
            <div className="file-info">
              <p className="file-name">Name</p>
              <p className="file-size">Size</p>
              <p className="file-date">Last Modified</p>
              <p className="file-actions">Actions</p>
            </div>
          </div>
        )}
        {files.map((file) => (
          <div 
            key={file.Key} 
            className={`file-item ${expandedFile === file.Key ? 'expanded' : ''}`}
            onClick={() => toggleExpand(file.Key)}
          >
            <div className="file-icon">
              {getFileType(file.Key) === 'image' ? (
                <img src={`http://localhost:5000/s3-file/${encodeURIComponent(file.Key)}`} alt={file.Key} />
              ) : (
                <i className="document-icon">📄</i>
              )}
            </div>
            <div className="file-info">
              <p className="file-name">{file.Key}</p>
              <p className="file-size">{(file.Size / 1024).toFixed(2)} KB</p>
              {(viewMode === 'list' || expandedFile === file.Key) && (
                <>
                  <p className="file-date">{new Date(file.LastModified).toLocaleString()}</p>
                  <div className="file-actions">
                    <a href={`http://localhost:5000/s3-file/${encodeURIComponent(file.Key)}`} target="_blank" rel="noopener noreferrer" className="download-button" title="Download">
                      ⬇️
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <button className="view-toggle-button" onClick={toggleViewMode}>
        {viewMode === 'grid' ? '📋' : '📊'}
      </button>
      <button className="upload-button" onClick={() => setShowUpload(true)}>
        <span className="plus-icon">+</span>
      </button>
      {showUpload && (
        <Upload
          onClose={() => setShowUpload(false)}
          onUploadComplete={() => {
            setShowUpload(false);
            fetchFiles();
          }}
        />
      )}
    </div>
  );
}

export default MyFiles;
