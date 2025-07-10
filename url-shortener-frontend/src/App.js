import React, { useState, useEffect, useContext, createContext } from 'react';
import { Eye, Trash2, LogOut, User, Plus, Edit3, Save, X } from 'lucide-react';
import './App.css';

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        await fetchUserProfile(data.token);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Login Component
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          setSuccess('Registration successful! You can now login.');
          setIsRegisterMode(false);
          setPassword('');
          setConfirmPassword('');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <span className="text-2xl text-white">🔗</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">URL Shortener</h1>
          <p className="text-gray-600">Shorten your links with ease</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isRegisterMode ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600">
              {isRegisterMode 
                ? 'Join us to start shortening your URLs' 
                : 'Sign in to your account'
              }
            </p>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => !isRegisterMode && toggleMode()}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                !isRegisterMode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => isRegisterMode && toggleMode()}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                isRegisterMode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
              <span className="mr-2">✅</span>
              {success}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
              <span className="mr-2">❌</span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your username"
                  required
                />
                <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={isRegisterMode ? "Create a password" : "Enter your password"}
                  autoComplete="current-password"
                  required
                />
                <span className="absolute left-3 top-3.5 text-gray-400">🔒</span>
              </div>
              {isRegisterMode && (
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              )}
            </div>

            {isRegisterMode && (
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your password"
                    required
                  />
                  <span className="absolute left-3 top-3.5 text-gray-400">🔒</span>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isRegisterMode ? 'Creating Account...' : 'Signing In...'}</span>
                </>
              ) : (
                <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
              )}
            </button>
          </form>
          
          {!isRegisterMode && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
              <div className="text-xs text-blue-700 space-y-1">
                <div><strong>Admin:</strong> admin / admin123</div>
                <div><strong>User:</strong> Create a new account or use existing credentials</div>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {isRegisterMode 
                ? 'By creating an account, you agree to our terms of service.' 
                : 'New to URL Shortener? Create an account to get started.'
              }
            </p>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 URL Shortener. Made with GGLUTT</p>
        </div>
      </div>
    </div>
  );
};


const Header = ({ currentView, setCurrentView }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-8">
            <h1 className="text-3xl font-bold text-white flex items-center space-x-2">
              <span className="bg-white text-blue-600 rounded-lg px-3 py-1 text-2xl">🔗</span>
              <span>URL Shortener</span>
            </h1>
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentView('urls')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'urls' 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'text-blue-100 hover:text-white hover:bg-blue-500'
                }`}
              >
                📊 URLs
              </button>
              <button
                onClick={() => setCurrentView('about')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'about' 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'text-blue-100 hover:text-white hover:bg-blue-500'
                }`}
              >
                ℹ️ About
              </button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <User className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">
                    {user.username} {isAdmin && '👑'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const AddUrlForm = ({ onUrlAdded }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalUrl })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`✅ Short URL created: ${data.shortUrl}`);
        setMessageType('success');
        setOriginalUrl('');
        onUrlAdded();
      } else {
        const error = await response.json();
        setMessage(`❌ ${error.message}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('❌ Network error occurred');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 shadow-lg border border-blue-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
        <Plus className="h-6 w-6 text-blue-600" />
        <span>Add New URL</span>
      </h2>
      
      {message && (
        <div className={`mb-4 p-4 rounded-lg border ${
          messageType === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-4">
          <input
            type="url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            {loading ? '⏳ Shortening...' : '🔗 Shorten'}
          </button>
        </div>
      </form>
    </div>
  );
};

const UrlsTable = ({ setCurrentView, setSelectedUrlId }) => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, isAdmin } = useAuth();

  const fetchUrls = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/urls');
      if (response.ok) {
        const data = await response.json();
        setUrls(data);
      }
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this URL?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/urls/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUrls(urls.filter(url => url.id !== id));
      } else {
        alert('Failed to delete URL');
      }
    } catch (error) {
      alert('Error deleting URL');
    }
  };

  const handleViewDetails = (id) => {
    setSelectedUrlId(id);
    setCurrentView('urlInfo');
  };

  const canDelete = (url) => {
    return isAuthenticated && (isAdmin || url.createdById === user?.id);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {isAuthenticated && (
        <AddUrlForm onUrlAdded={fetchUrls} />
      )}
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <span>📋</span>
            <span>Short URLs</span>
          </h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading URLs...</span>
          </div>
        ) : urls.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔗</div>
            <p className="text-gray-500 text-lg">No URLs found</p>
            <p className="text-gray-400">Create your first short URL above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original URL</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short Code</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {urls.map((url, index) => (
                  <tr key={url.id} className={`hover:bg-blue-50 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs" title={url.originalUrl}>
                        {url.originalUrl}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                          {url.shortCode}
                        </code>
                        <button
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(`${window.location.origin}/${url.shortCode}`);
                            } else {
                              const textArea = document.createElement('textarea');
                              textArea.value = `${window.location.origin}/${url.shortCode}`;
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand('copy');
                              document.body.removeChild(textArea);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{url.createdBy}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        👆 {url.clickCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUrlId(url.id);
                          setCurrentView('urlInfo');
                        }}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-100 rounded"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {(user?.id === url.createdById || user?.isAdmin) && (
                        <button
                          onClick={() => handleDelete(url.id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-100 rounded"
                          title="Delete URL"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// URL Info Component
const UrlInfo = ({ urlId, setCurrentView }) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/urls/${urlId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUrl(data);
        } else {
          setError('Failed to fetch URL details');
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (urlId) {
      fetchUrl();
    }
  }, [urlId]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!url) {
    return (
      <div className="text-center py-8 text-gray-500">
        URL not found
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">URL Details</h3>
        <button
          onClick={() => setCurrentView('urls')}
          className="text-blue-600 hover:text-blue-900"
        >
          ← Back to URLs
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Original URL</label>
          <div className="mt-1 text-sm text-gray-900 break-all">
            <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {url.originalUrl}
            </a>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Short Code</label>
          <div className="mt-1 text-sm font-mono text-blue-600">
            {url.shortCode}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Created By</label>
          <div className="mt-1 text-sm text-gray-900">
            {url.createdBy}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Created Date</label>
          <div className="mt-1 text-sm text-gray-900">
            {new Date(url.createdDate).toLocaleString()}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Click Count</label>
          <div className="mt-1 text-sm text-gray-900">
            {url.clickCount}
          </div>
        </div>
        
        {url.lastAccessed && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Accessed</label>
            <div className="mt-1 text-sm text-gray-900">
              {new Date(url.lastAccessed).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// About Component
const About = () => {
  const [content, setContent] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isAdmin } = useAuth();

  const fetchAboutContent = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/about');
      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        setEditContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: editContent })
      });

      if (response.ok) {
        setContent(editContent);
        setIsEditing(false);
      } else {
        alert('Failed to update content');
      }
    } catch (error) {
      alert('Error updating content');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">About URL Shortener</h3>
        {isAdmin && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-900"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit</span>
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter about content..."
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentView, setCurrentView] = useState('urls');
  const [selectedUrlId, setSelectedUrlId] = useState(null);
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && currentView === 'urlInfo') {
    setCurrentView('urls');
  }

  const renderContent = () => {
    switch (currentView) {
      case 'urls':
        return <UrlsTable setCurrentView={setCurrentView} setSelectedUrlId={setSelectedUrlId} />;
      case 'urlInfo':
        return isAuthenticated ? (
          <UrlInfo urlId={selectedUrlId} setCurrentView={setCurrentView} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            Please log in to view URL details
          </div>
        );
      case 'about':
        return <About />;
      default:
        return <UrlsTable setCurrentView={setCurrentView} setSelectedUrlId={setSelectedUrlId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? (
        <>
          <Header currentView={currentView} setCurrentView={setCurrentView} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </main>
        </>
      ) : (
        <Login />
      )}
    </div>
  );
};

const AppWithAuth = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWithAuth;