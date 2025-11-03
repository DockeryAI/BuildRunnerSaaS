import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

interface ApiKeyFormData {
  name: string;
  key: string;
}

/**
 * Component for managing API keys configuration
 * @returns JSX.Element
 */
const ApiKeysConfig: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<ApiKeyFormData>({
    name: '',
    key: ''
  });

  /**
   * Fetches existing API keys on component mount
   */
  useEffect(() => {
    fetchApiKeys();
  }, []);

  /**
   * Fetches API keys from backend
   */
  const fetchApiKeys = async (): Promise<void> => {
    try {
      const response = await fetch('/api/keys');
      if (!response.ok) throw new Error('Failed to fetch API keys');
      const data = await response.json();
      setApiKeys(data);
    } catch (error) {
      toast.error('Error fetching API keys');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles form input changes
   * @param event Change event from input
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles form submission to add new API key
   * @param event Form submission event
   */
  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to add API key');

      toast.success('API key added successfully');
      setFormData({ name: '', key: '' });
      fetchApiKeys();
    } catch (error) {
      toast.error('Error adding API key');
      console.error(error);
    }
  };

  /**
   * Deletes an API key
   * @param id ID of the API key to delete
   */
  const deleteApiKey = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/keys/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete API key');

      toast.success('API key deleted successfully');
      setApiKeys(prev => prev.filter(key => key.id !== id));
    } catch (error) {
      toast.error('Error deleting API key');
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="api-keys-config">
      <h2>API Keys Configuration</h2>

      <form onSubmit={handleSubmit} className="api-key-form">
        <div className="form-group">
          <label htmlFor="name">Key Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="key">API Key:</label>
          <input
            type="text"
            id="key"
            name="key"
            value={formData.key}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit">Add API Key</button>
      </form>

      <div className="api-keys-list">
        <h3>Existing API Keys</h3>
        {apiKeys.length === 0 ? (
          <p>No API keys configured</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Created</th>
                <th>Last Used</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map(key => (
                <tr key={key.id}>
                  <td>{key.name}</td>
                  <td>{key.key}</td>
                  <td>{new Date(key.createdAt).toLocaleDateString()}</td>
                  <td>
                    {key.lastUsed 
                      ? new Date(key.lastUsed).toLocaleDateString() 
                      : 'Never'}
                  </td>
                  <td>
                    <button
                      onClick={() => deleteApiKey(key.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .api-keys-config {
          padding: 20px;
        }

        .api-key-form {
          margin: 20px 0;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
        }

        .form-group input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        button:hover {
          background-color: #0056b3;
        }

        .delete-btn {
          background-color: #dc3545;
        }

        .delete-btn:hover {
          background-color: #c82333;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        th {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
};

export default ApiKeysConfig;