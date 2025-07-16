// Frontend: App.jsx (React) - Complete with Auth0 and Profile
import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import UserProfile from './UserProfile.jsx';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;
const MAX_LENGTH = 100;

// Loading component
const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

// Login button component
const LoginButton = () => {
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
const LogoutButton = ({ onShowProfile, userProfile }) => {
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

// Enhanced SecureInput with better styling and UX
const SecureInput = ({ value, onChange, onKeyDown, placeholder, autoFocus, isLarge = false }) => {
  const warning = value.length >= MAX_LENGTH - 10;
  return (
    <div className={`input-wrapper ${isLarge ? 'large' : ''}`}>
      <input
        type="text"
        maxLength={MAX_LENGTH}
        value={value}
        onChange={(e) => {
          const sanitized = e.target.value.replace(/[<>]/g, '').slice(0, MAX_LENGTH);
          onChange({ target: { value: sanitized } });
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
        autoFocus={autoFocus}
        className={`${warning ? 'warning' : ''} ${isLarge ? 'large-input' : ''}`}
      />
      <div className={`char-counter ${warning ? 'warning' : ''}`}>
        {value.length}/{MAX_LENGTH}
      </div>
    </div>
  );
};

// Icon components
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
  </svg>
);

const AddIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l1.99 1.99 3.473-4.353a.267.267 0 0 1 .02-.022Z"/>
  </svg>
);

const CancelIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
  </svg>
);

function App() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  // Set up axios interceptor to include auth token
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        if (isAuthenticated) {
          try {
            const token = await getAccessTokenSilently();
            config.headers.authorization = `Bearer ${token}`;
          } catch (error) {
            console.error('Error getting access token:', error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/profile`);
      setUserProfile(res.data);
      
      // Check if this is a new user (profile was just created with defaults)
      if (!hasCheckedProfile && isNewUser(res.data)) {
        setTimeout(() => {
          setShowProfile(true);
        }, 1000); // Small delay to let the UI load
      }
      setHasCheckedProfile(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setHasCheckedProfile(true);
    }
  };

  const isNewUser = (profile) => {
    // Consider it a new user if they haven't customized their profile beyond the auto-generated avatar
    return !profile.bio && 
           (!profile.displayName || 
            profile.displayName === user?.name || 
            profile.displayName === user?.email ||
            profile.displayName === 'User');
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/tasks`);
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/tasks`, { title: newTask });
      setNewTask('');
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (task) => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/tasks/${task._id}`, {
        completed: !task.completed,
        title: task.title,
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (task) => {
    setEditTaskId(task._id);
    setEditTaskTitle(task.title);
  };

  const cancelEditing = () => {
    setEditTaskId(null);
    setEditTaskTitle('');
  };

  const saveEdit = async (id) => {
    if (!editTaskTitle.trim()) return;
    setLoading(true);
    try {
      await axios.put(`${API_URL}/tasks/${id}`, { title: editTaskTitle });
      cancelEditing();
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTaskKeyDown = (e) => {
    if (e.key === 'Enter') addTask();
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') saveEdit(id);
    if (e.key === 'Escape') cancelEditing();
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const activeCount = tasks.filter(task => !task.completed).length;

  // Show loading spinner while Auth0 is loading
  if (isLoading) return <Loading />;

  // Show login page if not authenticated
  if (!isAuthenticated) return <LoginButton />;

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <h1>Task Manager</h1>
          <p className="subtitle">Stay organized and productive</p>
          <LogoutButton 
            onShowProfile={() => setShowProfile(true)} 
            userProfile={userProfile}
          />
        </header>

        <div className="add-task-section">
          <SecureInput
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleNewTaskKeyDown}
            placeholder="What needs to be done?"
            isLarge={true}
          />
          <button 
            onClick={addTask} 
            className="add-button"
            disabled={loading || !newTask.trim()}
          >
            <AddIcon />
            Add Task
          </button>
        </div>

        {tasks.length > 0 && (
          <div className="filter-section">
            <div className="filter-buttons">
              <button 
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All ({tasks.length})
              </button>
              <button 
                className={filter === 'active' ? 'active' : ''}
                onClick={() => setFilter('active')}
              >
                Active ({activeCount})
              </button>
              <button 
                className={filter === 'completed' ? 'active' : ''}
                onClick={() => setFilter('completed')}
              >
                Completed ({completedCount})
              </button>
            </div>
          </div>
        )}

        <div className="tasks-section">
          {loading && <div className="loading">Loading...</div>}
          
          {filteredTasks.length === 0 && !loading && (
            <div className="empty-state">
              {filter === 'all' ? (
                <p>No tasks yet. Add one above to get started!</p>
              ) : filter === 'active' ? (
                <p>No active tasks. Great job!</p>
              ) : (
                <p>No completed tasks yet.</p>
              )}
            </div>
          )}

          <ul className="task-list">
            {filteredTasks.map((task) => (
              <li key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                {editTaskId === task._id ? (
                  <div className="edit-mode">
                    <SecureInput
                      value={editTaskTitle}
                      onChange={(e) => setEditTaskTitle(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, task._id)}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button 
                        onClick={() => saveEdit(task._id)}
                        className="save-button"
                        disabled={!editTaskTitle.trim()}
                      >
                        <SaveIcon />
                      </button>
                      <button 
                        onClick={cancelEditing}
                        className="cancel-button"
                      >
                        <CancelIcon />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="task-view">
                    <label className="task-checkbox">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleComplete(task)}
                      />
                      <span className="checkmark">
                        {task.completed && <CheckIcon />}
                      </span>
                      <span className="task-title" title={task.title}>
                        {task.title}
                      </span>
                    </label>
                    <div className="task-actions">
                      <button 
                        onClick={() => startEditing(task)}
                        className="edit-button"
                        title="Edit task"
                      >
                        <EditIcon />
                      </button>
                      <button 
                        onClick={() => deleteTask(task._id)} 
                        className="delete-button"
                        title="Delete task"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {showProfile && (
          <UserProfile 
            onClose={() => setShowProfile(false)}
            onProfileUpdate={(updatedProfile) => {
              setUserProfile(updatedProfile);
            }}
            isNewUser={!hasCheckedProfile || isNewUser(userProfile)}
          />
        )}
      </div>
    </div>
  );
}

export default App;