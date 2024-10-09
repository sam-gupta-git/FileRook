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
      const response = await axios.get('http://localhost:5000/files');
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
      await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus('File uploaded successfully!');
      setFile(null);
      fetchFiles(); // Refresh the file list after upload
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error uploading file. Please try again.');
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
          <li key={file._id}>
            {file.filename} - Uploaded on: {new Date(file.uploadDate).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Upload;
