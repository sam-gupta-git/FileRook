import React, { useState } from 'react';
import axios from 'axios';
import './Upload.css';

function Upload({ onClose, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/s3-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload response:', response.data);
      setUploadStatus(`File uploaded successfully! Key: ${response.data.fileDetails.key}`);
      setFile(null);
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading file:', error);
      if (error.response) {
        setUploadStatus(`Error uploading file: ${error.response.data.error || error.response.data}`);
      } else if (error.request) {
        setUploadStatus('Error uploading file: No response received from server.');
      } else {
        setUploadStatus(`Error uploading file: ${error.message}`);
      }
    }
  };

  return (
    <div className="upload-overlay">
      <div className="upload-modal">
        <h2>Upload File</h2>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
        {uploadStatus && <p>{uploadStatus}</p>}
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default Upload;
