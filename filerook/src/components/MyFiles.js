import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyFiles.css';

function MyFiles() {
  const [files, setFiles] = useState([]);
  const [expandedFile, setExpandedFile] = useState(null);

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

  return (
    <div className="my-files-container">
      <h1>My Files</h1>
      <div className="file-grid">
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
              {expandedFile === file.Key && (
                <>
                  <p className="file-date">Last Modified: {new Date(file.LastModified).toLocaleString()}</p>
                  <a href={`http://localhost:5000/s3-file/${encodeURIComponent(file.Key)}`} target="_blank" rel="noopener noreferrer" className="download-link">
                    Download
                  </a>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyFiles;
