import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { EditIcon, SaveIcon, CancelIcon, UserIcon } from './components/Icons.jsx';

const API_URL = import.meta.env.VITE_API_URL;

const UserProfile = ({ onClose, onProfileUpdate, isNewUser = false }) => {
  const { user } = useAuth0();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(isNewUser); // Auto-edit mode for new users
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    avatar: '',
    bio: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/profile`);
      setProfile(res.data);
      setFormData({
        displayName: res.data.displayName || '',
        avatar: res.data.avatar || '',
        bio: res.data.bio || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    // Validate display name
    if (!formData.displayName.trim()) {
      alert('Display name is required');
      return;
    }

    setLoading(true);
    try {
      // Only send displayName and bio, not avatar (it's read-only)
      const profileData = {
        displayName: formData.displayName,
        bio: formData.bio
      };
      
      const res = await axios.put(`${API_URL}/profile`, profileData);
      setProfile(res.data);
      setEditing(false);
      
      // Notify parent component of profile update
      if (onProfileUpdate) {
        onProfileUpdate(res.data);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Error saving profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateNewAvatar = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/profile/new-avatar`);
      const newAvatar = res.data.avatar;
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        avatar: newAvatar
      }));
      
      // If we're not in edit mode, also update the saved profile
      if (!editing) {
        setProfile(prev => ({
          ...prev,
          avatar: newAvatar
        }));
        if (onProfileUpdate) {
          onProfileUpdate({ ...profile, avatar: newAvatar });
        }
      }
    } catch (error) {
      console.error('Error generating new avatar:', error);
      alert('Error generating new avatar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Sanitize input by removing potentially dangerous characters
    const sanitized = value.replace(/[<>]/g, '').slice(0, getMaxLength(field));
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitized
    }));
  };

  const getMaxLength = (field) => {
    switch(field) {
      case 'displayName': return 50;
      case 'bio': return 500;
      case 'avatar': return 500; // URL length limit
      default: return 100;
    }
  };

  const cancelEditing = () => {
    setFormData({
      displayName: profile?.displayName || '',
      avatar: profile?.avatar || '',
      bio: profile?.bio || ''
    });
    setEditing(false);
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  if (loading && !profile) {
    return (
      <div className="profile-modal">
        <div className="profile-content">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-modal">
      <div className="profile-content">
        <div className="profile-header">
          <h2>{isNewUser ? 'Welcome! Set Up Your Profile' : 'User Profile'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="profile-body">
          {isNewUser && !editing && (
            <div className="welcome-message">
              <p>🎉 Welcome to Task Manager! Let's personalize your profile to get started.</p>
            </div>
          )}

          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {(editing ? formData.avatar : profile?.avatar) ? (
                <img 
                  src={editing ? formData.avatar : profile?.avatar} 
                  alt="Avatar"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="avatar-fallback" style={{ 
                display: (editing ? formData.avatar : profile?.avatar) ? 'none' : 'flex' 
              }}>
                <UserIcon />
              </div>
            </div>
          </div>

          {editing ? (
            <div className="profile-form">
              <div className="form-group">
                <label>Display Name *</label>
                <input
                  type="text"
                  placeholder="Enter your display name"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  maxLength={50}
                  autoComplete="off"
                  spellCheck="false"
                  required
                />
                <span className="char-count">{formData.displayName.length}/50</span>
              </div>
              
              <div className="form-group">
                <label>Your Avatar</label>
                <input
                  type="text"
                  value={formData.avatar}
                  readOnly
                  disabled
                  style={{
                    backgroundColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                    cursor: 'not-allowed'
                  }}
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  🎨 Your unique geometric avatar is automatically generated and cannot be changed
                </small>
              </div>
              
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  maxLength={500}
                  rows={4}
                  autoComplete="off"
                  spellCheck="true"
                />
                <span className="char-count">{formData.bio.length}/500</span>
              </div>
              
              <div className="profile-actions">
                <button 
                  className="save-button"
                  onClick={saveProfile}
                  disabled={loading || !formData.displayName.trim()}
                >
                  <SaveIcon />
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
                <button 
                  className="cancel-button"
                  onClick={cancelEditing}
                  disabled={loading}
                >
                  <CancelIcon />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-display">
              <div className="profile-info">
                <h3>{profile?.displayName || user?.name || 'User'}</h3>
                <p className="profile-email">{user?.email}</p>
                {profile?.bio && (
                  <div className="profile-bio">
                    <h4>About</h4>
                    <p>{profile.bio}</p>
                  </div>
                )}
                {profile?.createdAt && (
                  <p className="profile-joined">
                    Joined {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              <button 
                className="edit-profile-button"
                onClick={() => setEditing(true)}
              >
                <EditIcon />
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;