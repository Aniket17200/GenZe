import { useState, useEffect } from 'react'
import { Users, Plus, Search, BookOpen, Clock, Globe, Lock, Crown, X, MessageCircle } from 'lucide-react'
import { apiService } from '../lib/api'
import Navbar from './Navbar'
import GroupMessagesModal from './GroupMessagesModal'

const StudyGroupsPage = () => {
  const [activeTab, setActiveTab] = useState('discover')
  const [searchTerm, setSearchTerm] = useState('')
  
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [myGroups, setMyGroups] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: 'Computer Science',
    isPrivate: false
  })
  const [creating, setCreating] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showMessagesModal, setShowMessagesModal] = useState(false)

  useEffect(() => {
    if (activeTab === 'discover') {
      loadStudyGroups()
    } else {
      loadMyGroups()
    }
  }, [activeTab, searchTerm])

  const loadStudyGroups = async () => {
    try {
      setLoading(true)
      const data = await apiService.getStudyGroups(searchTerm)
      setGroups(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadMyGroups = async () => {
    try {
      setLoading(true)
      const data = await apiService.getUserGroups()
      setMyGroups(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async (groupId) => {
    try {
      const group = groups.find(g => g.id === groupId)
      if (group.isJoined) {
        await apiService.leaveStudyGroup(groupId)
      } else {
        await apiService.joinStudyGroup(groupId)
      }
      
      setGroups(groups.map(g => 
        g.id === groupId 
          ? { ...g, isJoined: !g.isJoined, members: g.isJoined ? g.members - 1 : g.members + 1 }
          : g
      ))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    
    if (!createForm.name.trim() || !createForm.description.trim()) {
      setError('Name and description are required')
      return
    }
    
    setCreating(true)
    
    try {
      const newGroup = await apiService.createStudyGroup(createForm)
      setGroups([newGroup, ...groups])
      setShowCreateModal(false)
      setCreateForm({ name: '', description: '', category: 'Computer Science', isPrivate: false })
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Study Groups</h1>
          <p className="text-gray-600">Join communities of learners in your field</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                activeTab === 'discover' 
                  ? 'bg-sky-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Globe size={18} />
              Discover Groups
            </button>
            <button
              onClick={() => setActiveTab('my-groups')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                activeTab === 'my-groups' 
                  ? 'bg-sky-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Users size={18} />
              My Groups ({myGroups.length})
            </button>
          </div>
        </div>

        {activeTab === 'discover' && (
          <>
            {/* Search and Create */}
            <div className="flex gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search groups by name, category, or description..."
                  className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Create Group
              </button>
            </div>

            {/* Groups Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-6"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">{error}</div>
                <button 
                  onClick={loadStudyGroups}
                  className="bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                  <div key={group.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{group.avatar}</div>
                        <div>
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            {group.name}
                            {group.isPrivate ? <Lock size={16} className="text-gray-500" /> : null}
                          </h3>
                          <p className="text-sm text-gray-600">{group.category}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{group.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-500" />
                          <span className="text-gray-600">{group.members} members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Crown size={16} className="text-yellow-500" />
                          <span className="text-gray-600">{group.owner}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} className="text-gray-500" />
                        Active {group.lastActivity}
                      </div>
                    </div>

                    {group.isJoined ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedGroup(group)
                            setShowMessagesModal(true)
                          }}
                          className="flex-1 bg-sky-500 text-white py-3 rounded-xl font-medium hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <MessageCircle size={16} />
                          Messages
                        </button>
                        <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl font-medium flex items-center">
                          ✓
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className="w-full py-3 rounded-xl font-medium transition-colors bg-sky-500 text-white hover:bg-sky-600"
                      >
                        {group.isPrivate ? 'Request to Join' : 'Join Group'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'my-groups' && (
          loading ? (
            <div className="space-y-6">
              {[1,2].map(i => (
                <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">{error}</div>
              <button 
                onClick={loadMyGroups}
                className="bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {myGroups.map((group) => (
                <div key={group.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">
                      {groups.find(g => g.id === group.id)?.avatar}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        {group.name}
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          group.role === 'Admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {group.role}
                        </span>
                      </h3>
                      <p className="text-gray-600">{group.lastMessage}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {group.unreadMessages > 0 && (
                      <div className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                        {group.unreadMessages}
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        setSelectedGroup(group)
                        setShowMessagesModal(true)
                      }}
                      className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2"
                    >
                      <MessageCircle size={16} />
                      Open Chat
                    </button>
                  </div>
                </div>
                </div>
              ))}
              
              {myGroups.length === 0 && (
                <div className="text-center py-12">
                  <Users size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Groups Yet</h3>
                  <p className="text-gray-500 mb-6">Join your first study group to start collaborating!</p>
                  <button
                    onClick={() => setActiveTab('discover')}
                    className="bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 transition-colors"
                  >
                    Discover Groups
                  </button>
                </div>
              )}
            </div>
          )
        )}

        {/* Categories - Dynamic from backend */}
        {!loading && groups.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Popular Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...new Set(groups.map(g => g.category))].map((category) => {
                const categoryGroups = groups.filter(g => g.category === category)
                const icons = {
                  'Computer Science': '💻',
                  'Medicine': '🏥', 
                  'Business': '📊',
                  'Languages': '🌍',
                  'Engineering': '⚙️',
                  'Mathematics': '📐'
                }
                return (
                  <div 
                    key={category} 
                    className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSearchTerm(category)}
                  >
                    <div className="text-2xl mb-2">{icons[category] || '📚'}</div>
                    <div className="font-medium text-gray-800 text-sm">{category}</div>
                    <div className="text-xs text-gray-600">{categoryGroups.length} groups</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Create Study Group</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    placeholder="Enter group name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    placeholder="Describe your study group"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Business">Business</option>
                    <option value="Languages">Languages</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={createForm.isPrivate}
                    onChange={(e) => setCreateForm({...createForm, isPrivate: e.target.checked})}
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                    Private group (requires approval to join)
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 disabled:opacity-50 transition-colors"
                  >
                    {creating ? 'Creating...' : 'Create Group'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Group Messages Modal */}
        {showMessagesModal && selectedGroup && (
          <GroupMessagesModal 
            group={selectedGroup} 
            onClose={() => {
              setShowMessagesModal(false)
              setSelectedGroup(null)
            }} 
          />
        )}
      </div>
    </div>
  )
}

export default StudyGroupsPage