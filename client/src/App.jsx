// Frontend: App.jsx (React) 
import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import UserProfile from './UserProfile.jsx';
import './App.css';
import SecureInput from './components/SafetyComponents.jsx';
import { CheckIcon, EditIcon, DeleteIcon, AddIcon, SaveIcon, CancelIcon } from './components/Icons.jsx';
import { Loading, LoginButton, LogoutButton } from './components/LoginButtons.jsx';
const API_URL = import.meta.env.VITE_API_URL;

// Main App component
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