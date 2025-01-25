import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [stats, setStats] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedFormats = ['image/png', 'image/jpeg', 'application/pdf'];

    if (selectedFile && allowedFormats.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      toast.error('Invalid file format. Please upload PNG, JPG, or PDF.');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a valid file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      toast.info('Uploading file...');

      const response = await axios.post('http://127.0.0.1:8000/documents/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setExtractedText(response.data.extracted_text);
      setMetadata(response.data.metadata || {});
      toast.success('File uploaded and processed successfully!');
    } catch (error) {
      toast.error('Failed to upload file. Please try again.');
      console.error('Upload Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query.');
      return;
    }

    try {
      const response = await axios.get(`http://127.0.0.1:8000/documents/search/?q=${searchQuery}`);
      setSearchResults(response.data.results);
      toast.success('Search completed successfully!');
    } catch (error) {
      toast.error('Failed to search documents.');
      console.error('Search Error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/documents/stats/');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch document stats.');
      console.error('Stats Error:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Document Recognition System</h2>

      <div className="mb-3">
        <input type="file" className="form-control" onChange={handleFileChange} />
      </div>

      <button className="btn btn-primary me-2" onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload Document'}
      </button>

      <button className="btn btn-secondary" onClick={fetchStats}>
        View Document Stats
      </button>

      {extractedText && (
        <div className="mt-4 p-3 border rounded bg-light">
          <h4>Extracted Text:</h4>
          <pre>{extractedText}</pre>
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="mt-2">
              <h5>Metadata:</h5>
              {Object.entries(metadata).map(([key, value]) => (
                <p key={key}><strong>{key}:</strong> {value}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-5">
        <h3>Search Documents</h3>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Enter keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-info" onClick={handleSearch}>
          Search
        </button>

        {searchResults.length > 0 && (
          <div className="mt-3">
            <h5>Search Results:</h5>
            <ul className="list-group">
              {searchResults.map((doc) => (
                <li key={doc.id} className="list-group-item">
                  <strong>Document:</strong> <a href={doc.file} target="_blank" rel="noopener noreferrer">{doc.file}</a>
                  <br />
                  <strong>Text:</strong> {doc.text.substring(0, 100)}...
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {stats && (
        <div className="mt-5">
          <h3>Document Statistics</h3>
          <p><strong>Total Documents:</strong> {stats.total_documents}</p>
          <ul className="list-group">
            {stats.document_types.map((docType, index) => (
              <li key={index} className="list-group-item">
                {docType.document_type || 'Unknown'} - {docType.count} documents
              </li>
            ))}
          </ul>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default UploadForm;
