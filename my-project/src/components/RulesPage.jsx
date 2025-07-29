import { Shield, Users, Video, MessageCircle, AlertTriangle, CheckCircle } from 'lucide-react'
import Navbar from './Navbar'

const RulesPage = () => {
  const rules = [
    {
      icon: <Video className="text-sky-500" size={24} />,
      title: "Camera Guidelines",
      rules: [
        "Keep your camera on during study sessions",
        "Ensure good lighting and clear video quality",
        "Dress appropriately as you would in a public library",
        "Avoid distracting backgrounds or movements"
      ]
    },
    {
      icon: <MessageCircle className="text-green-500" size={24} />,
      title: "Chat Etiquette",
      rules: [
        "Be respectful and supportive to all members",
        "Keep conversations study-related and motivational",
        "No spam, advertising, or inappropriate content",
        "Use appropriate language at all times"
      ]
    },
    {
      icon: <Users className="text-purple-500" size={24} />,
      title: "Community Behavior",
      rules: [
        "Respect others' study time and focus",
        "No harassment, bullying, or discrimination",
        "Help create a positive learning environment",
        "Report any inappropriate behavior to moderators"
      ]
    },
    {
      icon: <Shield className="text-red-500" size={24} />,
      title: "Privacy & Safety",
      rules: [
        "Do not share personal information publicly",
        "Respect others' privacy and boundaries",
        "Report any safety concerns immediately",
        "Follow platform guidelines for data protection"
      ]
    }
  ]

  const consequences = [
    { level: "Warning", description: "First violation results in a friendly reminder", color: "yellow" },
    { level: "Temporary Ban", description: "24-48 hour suspension for repeated violations", color: "orange" },
    { level: "Permanent Ban", description: "Serious violations result in account termination", color: "red" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Community <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">Rules</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our guidelines ensure a safe, respectful, and productive study environment for everyone.
          </p>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {rules.map((category, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                {category.icon}
                <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
              </div>
              <ul className="space-y-3">
                {category.rules.map((rule, ruleIndex) => (
                  <li key={ruleIndex} className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-gray-700">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Consequences Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Violation Consequences</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {consequences.map((consequence, index) => (
              <div key={index} className="text-center p-6 rounded-2xl border-2 border-gray-200">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  consequence.color === 'yellow' ? 'bg-yellow-100' :
                  consequence.color === 'orange' ? 'bg-orange-100' : 'bg-red-100'
                }`}>
                  <AlertTriangle className={`${
                    consequence.color === 'yellow' ? 'text-yellow-500' :
                    consequence.color === 'orange' ? 'text-orange-500' : 'text-red-500'
                  }`} size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{consequence.level}</h3>
                <p className="text-gray-600">{consequence.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Questions About Our Rules?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our community team is here to help clarify any guidelines
          </p>
          <button className="bg-white text-sky-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}

export default RulesPage