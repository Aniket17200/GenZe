import { Link } from 'react-router-dom'
import { Smartphone, Download, Star, Users, Video, MessageCircle, Trophy, Bell, ArrowRight } from 'lucide-react'
import Navbar from './Navbar'

const MobileAppPage = () => {
  const features = [
    {
      icon: <Video className="text-sky-500" size={32} />,
      title: "Mobile Video Rooms",
      description: "Join focus rooms on-the-go with optimized mobile video experience"
    },
    {
      icon: <Bell className="text-green-500" size={32} />,
      title: "Smart Notifications",
      description: "Get reminded about study sessions and stay connected with your study groups"
    },
    {
      icon: <MessageCircle className="text-blue-500" size={32} />,
      title: "Instant Messaging",
      description: "Chat with study partners and groups even when you're away from your desk"
    },
    {
      icon: <Trophy className="text-yellow-500" size={32} />,
      title: "Progress Tracking",
      description: "Monitor your study streaks and achievements wherever you are"
    }
  ]

  const screenshots = [
    { title: "Focus Rooms", emoji: "📱", description: "Browse and join study rooms" },
    { title: "Video Chat", emoji: "📹", description: "Study with peers via video" },
    { title: "Messages", emoji: "💬", description: "Chat with study groups" },
    { title: "Progress", emoji: "📊", description: "Track your study stats" }
  ]

  const testimonials = [
    {
      name: "Sarah M.",
      rating: 5,
      text: "Perfect for studying during my commute. Love the mobile experience!",
      avatar: "S"
    },
    {
      name: "Alex K.",
      rating: 5,
      text: "Finally can stay connected with my study group even when I'm not at home.",
      avatar: "A"
    },
    {
      name: "Maria L.",
      rating: 5,
      text: "The notifications help me stick to my study schedule. Highly recommend!",
      avatar: "M"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="text-8xl mb-6">📱</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Study Anywhere with the <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">GenZce App</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Take your study sessions on the go. Join focus rooms, chat with study partners, and track your progress from anywhere.
          </p>
          
          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="bg-black text-white px-8 py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-all inline-flex items-center gap-3">
              <div className="text-2xl">📱</div>
              <div className="text-left">
                <div className="text-xs opacity-75">Download on the</div>
                <div className="text-lg font-bold">App Store</div>
              </div>
            </button>
            <button className="bg-black text-white px-8 py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-all inline-flex items-center gap-3">
              <div className="text-2xl">🤖</div>
              <div className="text-left">
                <div className="text-xs opacity-75">Get it on</div>
                <div className="text-lg font-bold">Google Play</div>
              </div>
            </button>
          </div>
          
          <p className="text-sm text-gray-500">Coming Soon - Join the waitlist to be notified!</p>
        </div>

        {/* Screenshots Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">App Screenshots</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {screenshots.map((screenshot, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg mb-4 aspect-[9/16] flex flex-col items-center justify-center">
                  <div className="text-6xl mb-4">{screenshot.emoji}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{screenshot.title}</h3>
                  <p className="text-gray-600 text-sm">{screenshot.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Mobile-First Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-sky-600 mb-2">50K+</div>
              <div className="text-gray-600">Waitlist Signups</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">4.9★</div>
              <div className="text-gray-600">Expected Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">iOS & Android</div>
              <div className="text-gray-600">Both Platforms</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">Q2 2024</div>
              <div className="text-gray-600">Launch Date</div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Beta Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Waitlist Section */}
        <div className="text-center bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Join the Waitlist</h2>
          <p className="text-xl mb-8 opacity-90">
            Be the first to know when the GenZce mobile app launches
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-6">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-sky-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
              Join Waitlist
              <ArrowRight size={18} />
            </button>
          </div>
          <p className="text-sm opacity-75">
            Join 50,000+ students already on the waitlist
          </p>
        </div>
      </div>
    </div>
  )
}

export default MobileAppPage