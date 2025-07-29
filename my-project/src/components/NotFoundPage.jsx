import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { useAuth } from '../App'
import Navbar from './Navbar'

const NotFoundPage = () => {
  const { isLoggedIn } = useAuth()

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12">
            {/* 404 Illustration */}
            <div className="mb-8">
              <div className="text-8xl font-bold text-sky-500 mb-4">404</div>
              <div className="w-24 h-24 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-3xl">😵</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Page not found
            </h1>
            
            <p className="text-gray-600 mb-8">
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back to studying!
            </p>

            <div className="space-y-4">
              <Link
                to={isLoggedIn ? "/dashboard" : "/"}
                className="w-full bg-sky-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sky-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
              >
                <Home size={20} />
                <span>{isLoggedIn ? 'Go to Dashboard' : 'Go Home'}</span>
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="w-full border-2 border-sky-500 text-sky-500 px-6 py-3 rounded-xl font-semibold hover:bg-sky-50 transition-all flex items-center justify-center space-x-2"
              >
                <ArrowLeft size={20} />
                <span>Go Back</span>
              </button>
            </div>

            {/* Helpful Links */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Need help? Try these:</p>
              <div className="space-y-2">
                {isLoggedIn ? (
                  <>
                    <Link to="/dashboard" className="block text-sky-600 hover:text-sky-500 text-sm">
                      Dashboard
                    </Link>
                    <Link to="/create-room" className="block text-sky-600 hover:text-sky-500 text-sm">
                      Create Study Room
                    </Link>
                    <Link to="/messages" className="block text-sky-600 hover:text-sky-500 text-sm">
                      Messages
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block text-sky-600 hover:text-sky-500 text-sm">
                      Sign In
                    </Link>
                    <Link to="/signup" className="block text-sky-600 hover:text-sky-500 text-sm">
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>
    </div>
  )
}

export default NotFoundPage