import { Link } from 'react-router-dom'
import { Play, Users, Video, MessageCircle, Trophy, Clock, ArrowRight, CheckCircle } from 'lucide-react'
import Navbar from './Navbar'

const HowItWorksPage = () => {
  const steps = [
    {
      icon: <Users className="text-sky-500" size={32} />,
      title: "Create Account",
      description: "Sign up for free and join our global study community"
    },
    {
      icon: <Video className="text-blue-500" size={32} />,
      title: "Join Focus Room",
      description: "Choose from 24/7 study rooms with different atmospheres"
    },
    {
      icon: <MessageCircle className="text-green-500" size={32} />,
      title: "Study Together",
      description: "Stay focused with peers and use chat for motivation"
    },
    {
      icon: <Trophy className="text-yellow-500" size={32} />,
      title: "Track Progress",
      description: "Monitor your study time and climb the leaderboards"
    }
  ]

  const features = [
    "24/7 focus rooms with live video",
    "Global leaderboards and achievements",
    "Study groups and private messaging",
    "AI-powered study tools",
    "Pomodoro timer integration",
    "Progress tracking and analytics"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            How <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">GenZce</span> Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands of students in virtual study rooms. Stay focused, motivated, and connected with peers worldwide.
          </p>
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl blur opacity-75"></div>
            <button className="relative bg-white text-sky-600 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-3">
              <Play size={24} />
              Watch Demo Video
            </button>
          </div>
        </div>

        {/* Steps Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Get Started in 4 Simple Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                <span className="text-gray-700 text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Studying?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of students already using GenZce</p>
          <Link
            to="/signup"
            className="bg-white text-sky-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HowItWorksPage