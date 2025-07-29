import { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, CheckCircle, Circle, Flame, Target, Trash2, Edit } from 'lucide-react'
import { apiService } from '../lib/api'
import Navbar from './Navbar'

const TasksPage = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: 'General',
    estimatedTime: 60
  })

  const [showAddTask, setShowAddTask] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await apiService.getTasks()
      setTasks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTask = async (taskId) => {
    try {
      await apiService.toggleTaskComplete(taskId)
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      ))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await apiService.deleteTask(taskId)
      setTasks(tasks.filter(task => task.id !== taskId))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return
    
    try {
      const task = await apiService.createTask(newTask)
      setTasks([...tasks, task])
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        category: 'General',
        estimatedTime: 60
      })
      setShowAddTask(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredTasks = tasks.filter(task => {
    switch(filter) {
      case 'completed': return task.completed
      case 'pending': return !task.completed
      case 'overdue': return !task.completed && new Date(task.dueDate) < new Date()
      default: return true
    }
  })

  const totalStudyTime = tasks.reduce((total, task) => total + (task.studyTime || 0), 0)
  const completedTasks = tasks.filter(task => task.completed).length
  const totalEstimatedTime = tasks.reduce((total, task) => total + (task.estimatedTime || 0), 0)
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Tasks & Progress</h1>
            <p className="text-gray-600">Manage your study tasks and track your productivity</p>
          </div>
          <button
            onClick={() => setShowAddTask(true)}
            className="bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-sky-600 mb-2">{tasks.length}</div>
            <div className="text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{completedTasks}</div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{Math.floor(totalStudyTime / 60)}h</div>
            <div className="text-gray-600">Study Time</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {completionRate}%
            </div>
            <div className="text-gray-600">Completion Rate</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 flex gap-2">
            {[
              { key: 'all', label: 'All Tasks' },
              { key: 'pending', label: 'Pending' },
              { key: 'completed', label: 'Completed' },
              { key: 'overdue', label: 'Overdue' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-6 py-3 rounded-xl transition-all ${
                  filter === key 
                    ? 'bg-sky-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={loadTasks}
              className="bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
            <div key={task.id} className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg transition-all ${task.completed ? 'opacity-75' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="mt-1"
                  >
                    {task.completed ? (
                      <CheckCircle className="text-green-500" size={24} />
                    ) : (
                      <Circle className="text-gray-400 hover:text-sky-500" size={24} />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-xl font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{task.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {task.studyTime}m / {task.estimatedTime}m
                      </div>
                      <div className="flex items-center gap-2">
                        <Target size={16} />
                        {task.category}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-sky-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((task.studyTime / task.estimatedTime) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Task</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter task title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    rows="3"
                    placeholder="Task description..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <input
                      type="text"
                      value={newTask.category}
                      onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Est. Time (min)</label>
                    <input
                      type="number"
                      value={newTask.estimatedTime}
                      onChange={(e) => setNewTask({...newTask, estimatedTime: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      min="15"
                      step="15"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="flex-1 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TasksPage