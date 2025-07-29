import { Link } from 'react-router-dom'
import { ArrowRight, Users, Clock, Video, MessageCircle, Calendar, Star } from 'lucide-react'
import Navbar from './Navbar'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 gradient-primary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
          <div className="absolute top-40 right-10 w-96 h-96 gradient-secondary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 gradient-accent rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-transparent bg-clip-text text-sm font-semibold tracking-wider uppercase">✨ Study Smarter Together</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              The World's <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-transparent bg-clip-text">#1 Study</span>
              <br />Community
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Join students worldwide in 24/7 focus rooms. Study together, compete on leaderboards, and achieve your goals with AI-powered tools.
            </p>
            
            {/* Focus Rooms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
              <Link to="/signup" className="group relative bg-white/80 backdrop-blur-md border border-sky-200 rounded-2xl p-8 card-hover shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <Users className="text-sky-500" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Silent Study Hall</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-transparent bg-clip-text mb-1">LIVE</p>
                  <p className="text-gray-600 text-sm">24/7 focus room</p>
                </div>
              </Link>
              
              <Link to="/signup" className="group relative bg-white/80 backdrop-blur-md border border-sky-200 rounded-2xl p-8 card-hover shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <Users className="text-sky-500" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pomodoro Power</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-transparent bg-clip-text mb-1">LIVE</p>
                  <p className="text-gray-600 text-sm">Timer-based sessions</p>
                </div>
              </Link>
              
              <Link to="/signup" className="group relative bg-white/80 backdrop-blur-md border border-sky-200 rounded-2xl p-8 card-hover shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <Users className="text-sky-500" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Study Café</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-transparent bg-clip-text mb-1">LIVE</p>
                  <p className="text-gray-600 text-sm">Casual atmosphere</p>
                  <div className="mt-3 px-3 py-1 bg-orange-100 rounded-full">
                    <p className="text-orange-600 text-xs font-medium">Join to see live count</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Why Join Section */}
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/80 backdrop-blur-md border border-sky-200 rounded-3xl p-12 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why join a <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-transparent bg-clip-text">Focus Room?</span>
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                Looking for a place to focus and study with strangers? Try GenZce's focus rooms. Open 24 hours a day — no matter what timezone or country you live in, there will always be a study room for you to work alongside other students.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                The perfect place to boost productivity, make new friends and be more accountable for your studies. Join and study with the GenZce community today and get one step closer to achieving your goals: get better grades, study abroad, work abroad, and land a dream job.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 relative bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              About <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-transparent bg-clip-text">GenZce</span>
            </h2>
            <p className="text-gray-600 text-lg">Everything you need to know about our platform</p>
          </div>
          <div className="space-y-4">
            <details className="group bg-white/90 backdrop-blur-md border border-sky-200 rounded-2xl p-6 card-hover shadow-lg">
              <summary className="font-semibold text-gray-900 cursor-pointer text-lg flex items-center justify-between">
                What is GenZce and what can I do here?
                <span className="text-sky-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed">
                GenZce is the world's largest online study community with 24/7 focus rooms, global leaderboards, AI study tools, social features, and study groups to help you achieve your academic goals.
              </div>
            </details>
            <details className="group bg-white/90 backdrop-blur-md border border-sky-200 rounded-2xl p-6 card-hover shadow-lg">
              <summary className="font-semibold text-gray-900 cursor-pointer text-lg flex items-center justify-between">
                Do I need to work in a specific field or belong to a particular organization?
                <span className="text-sky-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed">
                No! GenZce is open to everyone regardless of field, organization, or background. All learners are welcome.
              </div>
            </details>
            <details className="group bg-white/90 backdrop-blur-md border border-sky-200 rounded-2xl p-6 card-hover shadow-lg">
              <summary className="font-semibold text-gray-900 cursor-pointer text-lg flex items-center justify-between">
                How do I join GenZce?
                <span className="text-sky-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed">
                Simply click on any focus room above to get started. Create an account and you'll be studying with others in minutes!
              </div>
            </details>
            <details className="group bg-white/90 backdrop-blur-md border border-sky-200 rounded-2xl p-6 card-hover shadow-lg">
              <summary className="font-semibold text-gray-900 cursor-pointer text-lg flex items-center justify-between">
                Who is behind GenZce and what is their mission?
                <span className="text-sky-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed">
                GenZce was created to help students worldwide stay focused and accountable through virtual body doubling, gamification, AI tools, and community support.
              </div>
            </details>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 overflow-hidden relative bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              We <span className="text-red-500">❤️</span> our <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-transparent bg-clip-text">GenZce Users</span>...
            </h2>
            <p className="text-gray-600 text-lg">Real feedback from our amazing community</p>
          </div>
          <div className="relative">
            <div className="flex animate-scroll space-x-6">
              {[
                { name: "Annalisa B", handle: "annalisa", text: "I just wanted to say that the platform is a real lifesaver!", color: "from-sky-500 to-blue-500" },
                { name: "Aras Bozkurt", handle: "@arasbozkurt", text: "If you don't want to work alone, this may be the medium you're looking for.", color: "from-blue-500 to-cyan-500" },
                { name: "al.", handle: "@blewhesmind", text: "This platform saved me", color: "from-sky-400 to-blue-600" },
                { name: "jei⁷", handle: "@geonjei", text: "I literally finished all my tasks 🤣😭", color: "from-cyan-500 to-blue-500" },
                { name: "Maria Rita", handle: "@Eu_MariaRita", text: "yes that's right I prefer to turn on the camera and work with strangers...", color: "from-blue-400 to-sky-500" },
                { name: "Miss. Relle", handle: "@miss_mirelle", text: "Thank you to whoever is that handsome in the livestream. I finished my work.", color: "from-sky-500 to-blue-400" },
                // Duplicate for seamless loop
                { name: "Annalisa B", handle: "annalisa", text: "I just wanted to say that the platform is a real lifesaver!", color: "from-sky-500 to-blue-500" },
                { name: "Aras Bozkurt", handle: "@arasbozkurt", text: "If you don't want to work alone, this may be the medium you're looking for.", color: "from-blue-500 to-cyan-500" },
                { name: "al.", handle: "@blewhesmind", text: "This platform saved me", color: "from-sky-400 to-blue-600" },
                { name: "jei⁷", handle: "@geonjei", text: "I literally finished all my tasks 🤣😭", color: "from-cyan-500 to-blue-500" },
                { name: "Maria Rita", handle: "@Eu_MariaRita", text: "yes that's right I prefer to turn on the camera and work with strangers...", color: "from-blue-400 to-sky-500" },
                { name: "Miss. Relle", handle: "@miss_mirelle", text: "Thank you to whoever is that handsome in the livestream. I finished my work.", color: "from-sky-500 to-blue-400" }
              ].map((testimonial, i) => (
                <div key={i} className="bg-white/90 backdrop-blur-md border border-sky-200 rounded-2xl p-6 min-w-[350px] flex-shrink-0 hover-lift shadow-lg">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${testimonial.color} flex items-center justify-center text-white font-bold text-lg`}>
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-gray-500 text-sm">{testimonial.handle}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative bg-gradient-to-r from-sky-50 to-blue-50">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/90 backdrop-blur-md border border-sky-200 rounded-3xl p-12 shadow-xl">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-transparent bg-clip-text">focus</span> with friends?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join thousands of students studying together in virtual focus rooms. Start your productive journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="group bg-gradient-to-r from-sky-500 to-blue-600 text-white px-10 py-4 rounded-2xl font-semibold hover:from-sky-600 hover:to-blue-700 transition-all transform hover:scale-105 inline-flex items-center justify-center space-x-2 shadow-lg hover:shadow-2xl"
              >
                <span>Start studying now</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="bg-white border border-sky-300 text-sky-600 px-10 py-4 rounded-2xl font-semibold hover:bg-sky-50 transition-all inline-flex items-center justify-center space-x-2 shadow-md"
              >
                <span>Sign in</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 bg-gray-900">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 text-transparent bg-clip-text">GenZce</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">The world's #1 online study community</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <div className="space-y-3">
                <Link to="/" className="block text-gray-400 hover:text-sky-400 transition-colors text-sm">Focus Room</Link>
                <Link to="/how-it-works" className="block text-gray-400 hover:text-sky-400 transition-colors text-sm">How it works</Link>
                <Link to="/community" className="block text-gray-400 hover:text-sky-400 transition-colors text-sm">Community</Link>
                <Link to="/rules" className="block text-gray-400 hover:text-sky-400 transition-colors text-sm">Rules</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <div className="space-y-3">
                <Link to="/blog" className="block text-gray-400 hover:text-blue-400 transition-colors text-sm">Blog</Link>
                <Link to="/contact" className="block text-gray-400 hover:text-blue-400 transition-colors text-sm">Contact Us</Link>
                <Link to="/mobile" className="block text-gray-400 hover:text-blue-400 transition-colors text-sm">Mobile app</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <div className="space-y-3">
                <Link to="/terms" className="block text-gray-400 hover:text-sky-400 transition-colors text-sm">Terms & Conditions</Link>
                <Link to="/privacy" className="block text-gray-400 hover:text-sky-400 transition-colors text-sm">Privacy Policy</Link>
              </div>
            </div>
          </div>
          
          {/* Floating Message */}
          <div className="relative overflow-hidden bg-gradient-to-r from-sky-900/30 to-blue-900/30 backdrop-blur-md border border-sky-800/30 rounded-2xl p-6 mb-8">
            <div className="whitespace-nowrap animate-marquee">
              <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 text-transparent bg-clip-text font-medium text-lg">
                📱 TikTok • 📷 Instagram • 👥 Facebook • 🐦 Twitter • 💼 LinkedIn • 🎥 YouTube • 
                🎆 Join thousands of students in our focus rooms • 💪 Study together, achieve more • 
                ⏰ 24/7 virtual study sessions • 🌍 Connect with learners worldwide •
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-2">
              2025 © <span className="bg-gradient-to-r from-sky-400 to-blue-500 text-transparent bg-clip-text font-semibold">GenZce</span>
            </div>
            <div className="text-gray-500 text-xs">
              Empowering students worldwide through virtual collaboration
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage