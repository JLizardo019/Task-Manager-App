# Task Manager - Full Stack Application

A modern, secure task management application built with React, Node.js, MongoDB, and Auth0 authentication. Features a beautiful dark theme, user profiles with auto-generated avatars, and comprehensive task management capabilities.

## ✨ Features

### 🔐 **Authentication & Security**
- **Auth0 Integration** - Secure authentication with social login support
- **JWT Token Authentication** - Stateless, secure API authentication
- **Input Sanitization** - XSS protection and input validation
- **Rate Limiting** - API protection against abuse
- **User Isolation** - Each user only sees their own tasks

### 📋 **Task Management**
- **Create, Read, Update, Delete** tasks
- **Mark tasks as complete/incomplete**
- **Edit tasks inline** with keyboard shortcuts (Enter to save, Escape to cancel)
- **Filter tasks** by status (All, Active, Completed)
- **Real-time task counters**
- **Character limits** with visual feedback
- **Empty state messaging**

### 👤 **User Profiles**
- **Auto-generated geometric avatars** using DiceBear Shapes API
- **Custom display names** and bio
- **Profile customization modal**
- **New user onboarding** with automatic profile setup
- **Avatar display in header**

### 🎨 **Modern UI/UX**
- **Dark theme** with purple accents
- **Responsive design** - works on desktop and mobile
- **Loading states** and visual feedback
- **Professional animations** and transitions
- **Accessible design** with proper contrast and semantic markup

## 🛠 Tech Stack

### Frontend
- **React 18** with Hooks
- **Auth0 React SDK** for authentication
- **Axios** for API requests
- **CSS3** with CSS Variables
- **Vite** for development and building

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Auth0** for user authentication
- **JWT** token verification
- **XSS protection** with sanitization
- **CORS** enabled for cross-origin requests

### Database
- **MongoDB Atlas** (cloud database)
- **Two collections**: Tasks and UserProfiles
- **User data isolation** with Auth0 user IDs

### External Services
- **Auth0** - Authentication and user management
- **DiceBear API** - Automatic avatar generation
- **MongoDB Atlas** - Cloud database hosting

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Auth0 account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-manager-fullstack
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**

   **Backend (.env in server folder):**
   ```env
   AUTH0_DOMAIN=your-auth0-domain.auth0.com
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager?retryWrites=true&w=majority
   PORT=3001
   ```

   **Frontend (.env in client folder):**
   ```env
   VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-auth0-client-id
   VITE_API_URL=http://localhost:3001
   ```

### Auth0 Configuration

1. **Create Auth0 Application**
   - Type: Single Page Application
   - Allowed Callback URLs: `http://localhost:5173`
   - Allowed Logout URLs: `http://localhost:5173`
   - Allowed Web Origins: `http://localhost:5173`

2. **Create Auth0 API**
   - Name: Task Manager API
   - Identifier: `https://taskmanager-api`
   - Signing Algorithm: RS256

### MongoDB Atlas Setup

1. **Create MongoDB Atlas cluster**
2. **Create database user**
3. **Whitelist your IP address** or allow access from anywhere (0.0.0.0/0)
4. **Get connection string** and add to MONGO_URI

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```
   Server runs on http://localhost:3001

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   Frontend runs on http://localhost:5173

3. **Access the application**
   - Open http://localhost:5173 in your browser
   - Click "Log In" to authenticate with Auth0
   - Start managing your tasks!

## 📂 Project Structure

```
task-manager-fullstack/
├── client/                             # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Icons.jsx               # Stores all Icon components
│   │   │   ├── LoginButtons.jsx        # Stores all Login components
│   │   │   └── SafetyComponents.jsx    # Stores Safety UI features  
│   │   ├── App.jsx                     # Main application component
│   │   ├── UserProfile.jsx             # Profile management component
│   │   ├── App.css                     # Styles and theming
│   │   └── main.jsx                    # App entry point with Auth0 setup
│   ├── .env                            # Frontend environment variables
│   └── package.json
├── server/                             # Node.js backend
│   ├── server.js                       # Express server with all routes
│   ├── .env                            # Backend environment variables
│   └── package.json
└── README.md
```

## 🔑 Key Features Explained

### Authentication Flow
1. User clicks "Log In" → Redirected to Auth0
2. Auth0 handles authentication → Returns JWT token
3. Frontend stores token → Sends with each API request
4. Backend verifies JWT → Allows access to user's data

### Task Management
- Tasks are linked to Auth0 user IDs for isolation
- Real-time updates with optimistic UI updates
- Input sanitization prevents XSS attacks
- Character limits prevent database bloat

### Profile System
- Auto-generated avatars using DiceBear Shapes API
- Consistent colors matching the app theme
- Read-only avatars prevent user-generated content issues
- Optional custom display names and bio

### Security Features
- JWT token verification on all protected routes
- Input sanitization using XSS library
- Rate limiting (30 requests per minute per IP)
- CORS configuration for cross-origin security
- User data isolation by Auth0 user ID

## 🎨 Design Decisions

### Why Auth0?
- Industry-standard authentication
- Handles password security and compliance
- Social login support
- JWT token generation
- User management dashboard

### Why Auto-Generated Avatars?
- Eliminates user-generated content moderation
- Consistent visual design
- No broken image links
- Professional appearance
- Reduces onboarding friction

### Why Dark Theme?
- Modern, professional appearance
- Reduces eye strain
- Popular with developers and productivity apps
- Better for focus and concentration

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Update environment variables for production

### Backend (Railway/Render/Heroku)
1. Deploy the `server` folder
2. Set environment variables
3. Update CORS origins for production domain

### Database
- MongoDB Atlas is already cloud-hosted
- Update connection string if needed
- Consider upgrading to paid tier for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Auth0** for authentication services
- **DiceBear** for avatar generation API
- **MongoDB Atlas** for cloud database hosting
- **React** and **Node.js** communities for excellent documentation

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure MongoDB Atlas IP whitelist includes your IP
4. Check Auth0 application configuration

---

**Built with ❤️ using React, Node.js, MongoDB, and Auth0**