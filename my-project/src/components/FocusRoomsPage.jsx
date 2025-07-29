import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Clock, Video, Volume2, VolumeX, Settings } from 'lucide-react'
import { apiService } from '../lib/api'
import Navbar from './Navbar'

const FocusRoomsPage = () => {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    loadFocusRooms()
  }, [])

  const loadFocusRooms = async () => {
    try {
      setLoading(true)
      const data = await apiService.getFocusRooms()
      setRooms(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = async (roomId) => {
    try {
      await apiService.joinFocusRoom(roomId)
      navigate(`/room/${roomId}`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">24/7 Focus Rooms</h1>
          <p className="text-gray-600">Join thousands of students studying together around the clock</p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              Ambient Sounds
            </button>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
            <Settings size={20} />
            Room Settings
          </button>
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              onClick={loadFocusRooms}
              className="bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
            <div key={room.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{room.name}</h3>
                  <p className="text-sm text-gray-600">{room.theme}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${room.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </div>

              <p className="text-gray-700 mb-4 text-sm">{room.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">Participants</span>
                  </div>
                  <span className="text-sm font-medium">{room.participants}/{room.capacity}</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-sky-500 h-2 rounded-full transition-all"
                    style={{ width: `${(room.participants / room.capacity) * 100}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">Ambient</span>
                  </div>
                  <span className="text-sm font-medium">{room.ambientSound}</span>
                </div>
              </div>

              <button
                onClick={() => joinRoom(room.id)}
                className="w-full bg-sky-500 text-white py-3 rounded-xl hover:bg-sky-600 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Video size={20} />
                Join Room
              </button>
            </div>
          ))}
          </div>
        )}

        {/* Stats Section */}
        {!loading && rooms.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-sky-600 mb-2">{rooms.reduce((sum, room) => sum + (room.participants || 0), 0)}</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">Always Open</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{rooms.length}</div>
              <div className="text-gray-600">Active Rooms</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FocusRoomsPage