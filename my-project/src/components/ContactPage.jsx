import { useState } from 'react'
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Users } from 'lucide-react'
import Navbar from './Navbar'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const contactMethods = [
    {
      icon: <Mail className="text-sky-500" size={24} />,
      title: "Email Support",
      description: "Get help with your account or technical issues",
      contact: "support@genzce.com",
      response: "Within 24 hours"
    },
    {
      icon: <MessageCircle className="text-green-500" size={24} />,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      contact: "Available 24/7",
      response: "Instant response"
    },
    {
      icon: <Users className="text-purple-500" size={24} />,
      title: "Community Forum",
      description: "Connect with other students and get peer support",
      contact: "community.genzce.com",
      response: "Community driven"
    }
  ]

  const faqs = [
    {
      question: "How do I join a focus room?",
      answer: "Simply create an account and click on any available focus room. You'll be connected instantly with other students."
    },
    {
      question: "Is GenZce free to use?",
      answer: "Yes! GenZce offers free access to focus rooms and basic features. Premium features are available with our subscription plans."
    },
    {
      question: "Can I create private study groups?",
      answer: "Absolutely! You can create private study groups and invite specific friends or classmates to join your sessions."
    },
    {
      question: "What if I experience technical issues?",
      answer: "Our support team is available 24/7 to help with any technical problems. You can reach us via email or live chat."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Get in <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions, feedback, or need support? We're here to help you succeed in your studies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="technical">Technical Support</option>
                  <option value="account">Account Issues</option>
                  <option value="feedback">Feedback</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="form-textarea"
                  placeholder="Tell us how we can help you..."
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-sky-600 hover:to-blue-700 transition-all inline-flex items-center justify-center gap-2"
              >
                Send Message
                <Send size={18} />
              </button>
            </form>
          </div>

          {/* Contact Methods */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Other Ways to Reach Us</h2>
            
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.title}</h3>
                    <p className="text-gray-600 mb-3">{method.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-sky-600">{method.contact}</span>
                      <span className="text-gray-500">{method.response}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Office Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-red-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Office</h3>
                  <p className="text-gray-600 mb-2">123 Education Street<br />Learning District, LD 12345</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={16} />
                    <span>Mon-Fri: 9AM-6PM PST</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-l-4 border-sky-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Studying?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students in our focus rooms today
          </p>
          <button className="bg-white text-sky-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
            Join GenZce Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContactPage