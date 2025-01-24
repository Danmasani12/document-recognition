import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      toast.info('Uploading file...');

      const response = await axios.post('http://127.0.0.1:8000/documents/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setExtractedText(response.data.extracted_text);
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload file.');
      console.error('Upload Error:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Document Recognition System</h2>

      <div className="mb-3">
        <input type="file" className="form-control" onChange={handleFileChange} />
      </div>
      
      <button className="btn btn-primary" onClick={handleUpload}>
        Upload Document
      </button>

      {extractedText && (
        <div className="mt-4 p-3 border rounded bg-light">
          <h4>Extracted Text:</h4>
          <pre>{extractedText}</pre>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default UploadForm;
