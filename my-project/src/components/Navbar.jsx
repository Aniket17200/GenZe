import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Video, MessageCircle, User, Settings, LogOut, Trophy, Brain, Users, Target } from 'lucide-react'
import { useAuth } from '../App'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isLoggedIn, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-4 z-50 mx-4">
      <div className="bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-transparent bg-clip-text">GenZce</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isLoggedIn ? (
              <>
                <Link to="/" className="text-gray-700 hover:text-sky-600 transition-colors">Focus Room</Link>
                <Link to="/how-it-works" className="text-gray-700 hover:text-sky-600 transition-colors">How it works</Link>
                <Link to="/rules" className="text-gray-700 hover:text-sky-600 transition-colors">Rules</Link>
                <Link to="/blog" className="text-gray-700 hover:text-sky-600 transition-colors">Blog</Link>
                <Link to="/contact" className="text-gray-700 hover:text-sky-600 transition-colors">Contact Us</Link>
                <Link to="/mobile" className="text-gray-700 hover:text-sky-600 transition-colors">Mobile app</Link>
                <Link to="/signup" className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-all transform hover:scale-105">
                  Join a Focus Room
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-sky-600 transition-colors flex items-center space-x-1">
                  <Video size={16} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/focus-rooms" className="text-gray-700 hover:text-sky-600 transition-colors">Focus Rooms</Link>
                <Link to="/leaderboard" className="text-gray-700 hover:text-sky-600 transition-colors flex items-center space-x-1">
                  <Trophy size={16} />
                  <span>Leaderboard</span>
                </Link>
                <Link to="/ai-tools" className="text-gray-700 hover:text-sky-600 transition-colors flex items-center space-x-1">
                  <Brain size={16} />
                  <span>AI Tools</span>
                </Link>
                <Link to="/social" className="text-gray-700 hover:text-sky-600 transition-colors flex items-center space-x-1">
                  <MessageCircle size={16} />
                  <span>Social</span>
                </Link>
                <Link to="/study-groups" className="text-gray-700 hover:text-sky-600 transition-colors flex items-center space-x-1">
                  <Users size={16} />
                  <span>Groups</span>
                </Link>
                <Link to="/tasks" className="text-gray-700 hover:text-sky-600 transition-colors flex items-center space-x-1">
                  <Target size={16} />
                  <span>Tasks</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 transition-colors flex items-center space-x-1"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-sky-600 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {!isLoggedIn ? (
                <>
                  <Link to="/" className="text-gray-700 hover:text-sky-600 transition-colors">Focus Room</Link>
                  <Link to="/how-it-works" className="text-gray-700 hover:text-sky-600 transition-colors">How it works</Link>
                  <Link to="/rules" className="text-gray-700 hover:text-sky-600 transition-colors">Rules</Link>
                  <Link to="/blog" className="text-gray-700 hover:text-sky-600 transition-colors">Blog</Link>
                  <Link to="/contact" className="text-gray-700 hover:text-sky-600 transition-colors">Contact Us</Link>
                  <Link to="/mobile" className="text-gray-700 hover:text-sky-600 transition-colors">Mobile app</Link>
                  <Link to="/signup" className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-all transform hover:scale-105 text-center">
                    Join a Focus Room
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-sky-600 transition-colors flex items-center space-x-2">
                    <Video size={16} />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/focus-rooms" className="text-gray-700 hover:text-sky-600 transition-colors">Focus Rooms</Link>
                  <Link to="/leaderboard" className="text-gray-700 hover:text-sky-600 transition-colors flex items-center space-x-2">
                    <Trophy size={16} />
                    <span>Leaderboard</span>
                  </Link>
                  <Link to="/ai-tools" className="text-gray-700 hover:text-sky-600 transition-colors flex items-center space-x-2">
                    <Brain size={16} />
                    <span>AI Tools</span>
                  </Link>
                  <Link to="/social" className="text-gray-700 hover:text-sky-600 transition-colors flex items-center space-x-2">
                    <MessageCircle size={16} />
                    <span>Social</span>
                  </Link>
                  <Link to="/study-groups" className="text-gray-700 hover:text-sky-600 transition-colors flex items-center space-x-2">
                    <Users size={16} />
                    <span>Groups</span>
                  </Link>
                  <Link to="/tasks" className="text-gray-700 hover:text-sky-600 transition-colors flex items-center space-x-2">
                    <Target size={16} />
                    <span>Tasks</span>
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-sky-600 transition-colors flex items-center space-x-2">
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  <Link to="/settings" className="text-gray-700 hover:text-sky-600 transition-colors flex items-center space-x-2">
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 transition-colors flex items-center space-x-2 text-left"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar