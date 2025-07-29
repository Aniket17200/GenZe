import { Link } from 'react-router-dom'
import { Calendar, User, ArrowRight, Clock, Tag } from 'lucide-react'
import Navbar from './Navbar'

const BlogPage = () => {
  const featuredPost = {
    id: 1,
    title: "The Science Behind Virtual Study Groups: Why They Work",
    excerpt: "Discover the psychological and social benefits of studying with others online, backed by research and real student experiences.",
    author: "Dr. Sarah Chen",
    date: "2024-01-15",
    readTime: "8 min read",
    category: "Research",
    image: "🧠"
  }

  const posts = [
    {
      id: 2,
      title: "10 Proven Study Techniques for Better Focus",
      excerpt: "Evidence-based methods to improve concentration and retention during your study sessions.",
      author: "Alex Johnson",
      date: "2024-01-12",
      readTime: "5 min read",
      category: "Tips",
      image: "📚"
    },
    {
      id: 3,
      title: "Building Healthy Study Habits in the Digital Age",
      excerpt: "How to create sustainable study routines while managing screen time and digital distractions.",
      author: "Maria Rodriguez",
      date: "2024-01-10",
      readTime: "6 min read",
      category: "Wellness",
      image: "🌱"
    },
    {
      id: 4,
      title: "Success Stories: Students Who Transformed Their Grades",
      excerpt: "Real stories from GenZce users who improved their academic performance through virtual study groups.",
      author: "GenZce Team",
      date: "2024-01-08",
      readTime: "7 min read",
      category: "Success Stories",
      image: "🏆"
    },
    {
      id: 5,
      title: "The Future of Online Education and Collaboration",
      excerpt: "Exploring trends in virtual learning and how platforms like GenZce are shaping the future.",
      author: "Dr. Michael Park",
      date: "2024-01-05",
      readTime: "9 min read",
      category: "Future",
      image: "🚀"
    },
    {
      id: 6,
      title: "Managing Study Stress and Anxiety",
      excerpt: "Practical strategies for dealing with academic pressure and maintaining mental health.",
      author: "Lisa Thompson",
      date: "2024-01-03",
      readTime: "6 min read",
      category: "Wellness",
      image: "🧘"
    }
  ]

  const categories = ["All", "Research", "Tips", "Wellness", "Success Stories", "Future"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            GenZce <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">Blog</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Insights, tips, and stories to help you succeed in your academic journey
          </p>
        </div>

        {/* Featured Post */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-12 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </span>
                <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                  {featuredPost.category}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{featuredPost.title}</h2>
              <p className="text-gray-600 mb-6 text-lg">{featuredPost.excerpt}</p>
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  {featuredPost.author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(featuredPost.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  {featuredPost.readTime}
                </div>
              </div>
              <button className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-sky-600 hover:to-blue-700 transition-all inline-flex items-center gap-2">
                Read Article
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="text-center">
              <div className="text-8xl mb-4">{featuredPost.image}</div>
              <div className="text-gray-500">Featured Article</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-sky-100 hover:text-sky-600 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{post.image}</div>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  {post.category}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{post.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <User size={14} />
                  {post.author}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  {post.readTime}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {new Date(post.date).toLocaleDateString()}
                </span>
                <button className="text-sky-600 hover:text-sky-700 font-medium text-sm inline-flex items-center gap-1">
                  Read More
                  <ArrowRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 opacity-90">
            Get the latest study tips and insights delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-sky-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPage