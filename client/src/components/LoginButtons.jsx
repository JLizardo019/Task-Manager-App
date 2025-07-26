import { useAuth0 } from '@auth0/auth0-react';
import { UserIcon } from './Icons.jsx';

import { useState } from 'react';
import { useEffect } from 'react';
// Loading component
export const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

// Login button component
export const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Task Manager</h1>
        <p>Please log in to manage your tasks</p>
        <button 
          onClick={() => loginWithRedirect()}
          className="auth-button"
        >
          Log In
        </button>
      </div>
    </div>
  );
};

// Logout button component with profile and avatar
export const LogoutButton = ({ onShowProfile, userProfile }) => {
  const { logout, user } = useAuth0();
  
  // Use custom display name if available, fallback to Auth0 name/email
  const displayName = userProfile?.displayName || user?.name || user?.email || 'User';
  
  return (
    <div className="user-info-expanded">
      <div className="user-avatar-info">
        {userProfile?.avatar && (
          <div className="header-avatar">
            <img 
              src={userProfile.avatar} 
              alt="Your avatar"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="header-avatar-fallback">
              <UserIcon />
            </div>
          </div>
        )}
        <span>Welcome, {displayName}!</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={onShowProfile}
          className="profile-button"
        >
          Profile
        </button>
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="logout-button"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};