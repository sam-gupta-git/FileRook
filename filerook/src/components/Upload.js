import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Upload() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [files, setFiles] = useState([]);

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
      fetchFiles(); // Refresh the file list after upload
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
    <div>
      <h1>Upload Files</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {uploadStatus && <p>{uploadStatus}</p>}

      <h2>Uploaded Files</h2>
      <ul>
        {files.map((file) => (
          <li key={file.Key}>
            {file.Key} - Size: {file.Size} bytes - Last Modified: {new Date(file.LastModified).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Upload;
