import React, { useState } from 'react'
import { Brain, FileText, HelpCircle, Lightbulb, Download, Sparkles } from 'lucide-react'
import { apiService } from '../lib/api'
import Navbar from './Navbar'

const AIToolsPage = () => {
  const [activeTab, setActiveTab] = useState('notes')
  const [inputText, setInputText] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      alert('Please enter some content first')
      return
    }
    
    setIsGenerating(true)
    setGeneratedContent('')
    
    try {
      let result
      
      switch(activeTab) {
        case 'notes':
          result = await apiService.generateNotes(inputText)
          break
        case 'quiz':
          result = await apiService.generateQuiz(inputText)
          break
        case 'summary':
          result = await apiService.generateSummary(inputText)
          break
        default:
          throw new Error('Invalid tool selected')
      }
      
      if (result && result.content) {
        setGeneratedContent(result.content)
      } else {
        throw new Error('Invalid response from AI service')
      }
    } catch (err) {
      setGeneratedContent(`❌ Error: ${err.message}\n\nPlease try again.`)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadContent = () => {
    const element = document.createElement('a')
    const file = new Blob([generatedContent], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${activeTab}-${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Brain className="text-purple-600" size={40} />
            AI Study Tools
          </h1>
          <p className="text-gray-600">Supercharge your learning with AI-powered study assistance</p>
        </div>

        {/* Tool Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                activeTab === 'notes' 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <FileText size={18} />
              AI Note Taker
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                activeTab === 'quiz' 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <HelpCircle size={18} />
              AI Quiz Generator
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                activeTab === 'summary' 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Lightbulb size={18} />
              AI Study Summary
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              {activeTab === 'notes' && <FileText size={24} className="text-purple-600" />}
              {activeTab === 'quiz' && <HelpCircle size={24} className="text-purple-600" />}
              {activeTab === 'summary' && <Lightbulb size={24} className="text-purple-600" />}
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === 'notes' && 'AI Note Taker'}
                {activeTab === 'quiz' && 'AI Quiz Generator'}
                {activeTab === 'summary' && 'AI Study Summary'}
              </h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              {activeTab === 'notes' && 'Transform any content into structured, organized study notes'}
              {activeTab === 'quiz' && 'Create personalized quizzes to test your knowledge'}
              {activeTab === 'summary' && 'Get concise summaries of complex study materials'}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input Content
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    activeTab === 'notes' ? 'Paste your lecture content, textbook chapter, or study material here...' :
                    activeTab === 'quiz' ? 'Enter the topic or content you want to create a quiz about...' :
                    'Paste long articles, research papers, or study materials...'
                  }
                  className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={!inputText.trim() || isGenerating}
                className="w-full bg-purple-500 text-white py-3 px-6 rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="animate-spin" size={20} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain size={20} />
                    {activeTab === 'notes' && 'Generate Notes'}
                    {activeTab === 'quiz' && 'Generate Quiz'}
                    {activeTab === 'summary' && 'Create Summary'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Generated Content</h2>
              {generatedContent && (
                <button
                  onClick={downloadContent}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  <Download size={16} />
                  Download
                </button>
              )}
            </div>
            
            <div className="h-80 overflow-y-auto">
              {generatedContent ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700 font-sans">{generatedContent}</pre>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Brain size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Generated content will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Features Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
            <FileText size={32} className="mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Notes</h3>
            <p className="text-purple-100">AI organizes your content into structured, easy-to-review notes</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
            <HelpCircle size={32} className="mb-4" />
            <h3 className="text-xl font-semibold mb-2">Instant Quizzes</h3>
            <p className="text-blue-100">Generate practice questions from any study material instantly</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <Lightbulb size={32} className="mb-4" />
            <h3 className="text-xl font-semibold mb-2">Quick Summaries</h3>
            <p className="text-green-100">Get key insights from lengthy documents in seconds</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIToolsPage