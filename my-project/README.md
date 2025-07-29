# GenZce - Live Study Platform

> *"Where Gen-Z meets focused study"* — GenZce is a virtual study lounge where users can interact over video (cam only), chat, create groups, schedule sessions, and stay productive.

## 🚀 Features

### 🔐 Authentication-Based Access
- **Public Pages**: Landing, Login, Signup, 404
- **Protected Pages**: Dashboard, Room, Create Room, Messages, Profile, Settings
- **Smart Routing**: Auto-redirect based on authentication status

### 📱 Core Functionality
- **Live Video Sessions**: Camera-only study rooms with peers
- **Public Chat**: Real-time messaging in study rooms
- **Private Groups**: Exclusive study groups and direct messages
- **Study Schedule**: Plan and schedule future sessions
- **User Profiles**: Customizable profiles with study stats
- **Settings**: Comprehensive privacy and notification controls

### 🎨 Design Features
- **Gen-Z Aesthetic**: Clean, modern UI with sky blue theme
- **Glassmorphism**: Subtle glass effects and backdrop blur
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Smooth Animations**: Hover effects and transitions
- **Custom Fonts**: Poppins and Inter for modern typography

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **State Management**: React Context API

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx           # Responsive navigation
│   ├── LandingPage.jsx      # Public homepage
│   ├── LoginPage.jsx        # Authentication
│   ├── SignupPage.jsx       # User registration
│   ├── DashboardPage.jsx    # User dashboard
│   ├── CreateRoomPage.jsx   # Room creation
│   ├── RoomPage.jsx         # Live video session
│   ├── MessagesPage.jsx     # Chat interface
│   ├── ProfilePage.jsx      # User profile
│   ├── SettingsPage.jsx     # User settings
│   └── NotFoundPage.jsx     # 404 error page
├── App.jsx                  # Main app with routing
├── main.jsx                 # App entry point
└── index.css                # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd my-project
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:5173`

### Demo Credentials
- **Email**: demo@genzce.com
- **Password**: password

## 📱 Page Flow

### 🚪 Logged-Out Users
1. **Landing Page** (`/`) - Features, CTA, signup
2. **Login** (`/login`) - Authentication form
3. **Signup** (`/signup`) - Registration form

### 🔐 Logged-In Users
1. **Dashboard** (`/dashboard`) - Overview, active rooms, stats
2. **Create Room** (`/create-room`) - Room setup and scheduling
3. **Live Room** (`/room/:id`) - Video grid, chat, controls
4. **Messages** (`/messages`) - Private chats and groups
5. **Profile** (`/profile`) - User info, stats, achievements
6. **Settings** (`/settings`) - Privacy, notifications, preferences

## 🎯 Key Features Implemented

### ✅ Authentication Flow
- Context-based auth state management
- Protected and public-only routes
- Auto-redirect based on login status
- Demo login functionality

### ✅ Responsive Design
- Mobile-first approach
- Collapsible navigation
- Adaptive video grid layouts
- Touch-friendly interfaces

### ✅ Live Study Rooms
- Video grid with participant info
- Camera-only mode (audio disabled)
- Real-time chat sidebar
- Room controls and settings

### ✅ User Experience
- Smooth page transitions
- Loading states and feedback
- Form validation
- Error handling

## 🔮 Future Enhancements

### Phase 2 Features
- **WebRTC Integration**: Real video/audio streaming
- **Socket.IO**: Real-time chat and notifications
- **Backend API**: User management and data persistence
- **File Sharing**: Document and resource sharing
- **Whiteboard**: Collaborative drawing and notes
- **Screen Sharing**: Present and teach functionality

### Phase 3 Features
- **Mobile App**: React Native implementation
- **AI Study Assistant**: Smart recommendations
- **Study Analytics**: Detailed progress tracking
- **Gamification**: Points, badges, leaderboards
- **Integration**: Calendar, LMS, note-taking apps

## 🎨 Design System

### Colors
- **Primary**: `#0ea5e9` (sky-500)
- **Secondary**: `#0284c7` (sky-600)
- **Background**: `#f0f9ff` to `#e0f2fe` gradient
- **Glass**: `rgba(255, 255, 255, 0.1)` with backdrop blur

### Typography
- **Primary**: Inter (body text)
- **Secondary**: Poppins (headings)
- **Weights**: 300, 400, 500, 600, 700

### Components
- **Rounded corners**: `rounded-xl`, `rounded-2xl`
- **Shadows**: `shadow-lg`, `shadow-xl`
- **Transitions**: `transition-all`, `hover:scale-105`

## 📄 License

This project is created for educational purposes. Feel free to use and modify as needed.

---

**Built with ❤️ for the next generation of learners**