import { useState, useEffect } from 'react'
import { Trophy, Medal, Crown, Clock, Flame, Target } from 'lucide-react'
import { apiService } from '../lib/api'
import Navbar from './Navbar'

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('weekly')
  const [leaderboardData, setLeaderboardData] = useState({})
  const [userRank, setUserRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadLeaderboard(activeTab)
  }, [activeTab])

  const loadLeaderboard = async (period) => {
    try {
      setLoading(true)
      const [leaderboard, rank] = await Promise.all([
        apiService.getLeaderboard(period),
        apiService.getUserRank(period)
      ])
      
      setLeaderboardData(prev => ({ ...prev, [period]: leaderboard }))
      setUserRank(rank)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <Crown className="text-yellow-500" size={24} />
      case 2: return <Medal className="text-gray-400" size={24} />
      case 3: return <Medal className="text-amber-600" size={24} />
      default: return <Trophy className="text-gray-400" size={20} />
    }
  }

  const getRankBg = (rank) => {
    switch(rank) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-600"
      case 2: return "bg-gradient-to-r from-gray-300 to-gray-500"
      case 3: return "bg-gradient-to-r from-amber-400 to-amber-600"
      default: return "bg-white/70"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 Leaderboard</h1>
          <p className="text-gray-600">Compete with students worldwide and climb the ranks!</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 flex gap-2">
            {[
              { key: 'weekly', label: 'This Week', icon: Clock },
              { key: 'monthly', label: 'This Month', icon: Target },
              { key: 'allTime', label: 'All Time', icon: Flame }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  activeTab === key 
                    ? 'bg-sky-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        {loading ? (
          <div className="flex justify-center items-end gap-4 mb-12">
            {[1,2,3].map(i => (
              <div key={i} className="text-center">
                <div className="bg-gray-200 h-32 w-24 rounded-t-2xl animate-pulse mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={() => loadLeaderboard(activeTab)}
              className="bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : leaderboardData[activeTab]?.length > 0 && (
          <div className="flex justify-center items-end gap-4 mb-12">
            {leaderboardData[activeTab].slice(0, 3).map((user, index) => {
            const positions = [1, 0, 2] // Center 1st, left 2nd, right 3rd
            const heights = ['h-32', 'h-40', 'h-24']
            const actualRank = user.rank
            
            return (
              <div key={user.rank} className={`text-center ${index === 1 ? 'order-1' : index === 0 ? 'order-2' : 'order-3'}`}>
                <div className={`${getRankBg(actualRank)} ${heights[positions[index]]} w-24 rounded-t-2xl flex flex-col justify-end items-center p-4 shadow-lg`}>
                  <div className="text-4xl mb-2">{user.avatar}</div>
                  <div className="text-white font-bold text-lg">{actualRank}</div>
                </div>
                <div className="mt-4">
                  <div className="font-semibold text-gray-800">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.hours}h studied</div>
                  <div className="text-sm text-orange-600">🔥 {user.streak} day streak</div>
                </div>
              </div>
            )
          })}
          </div>
        )}

        {/* Full Leaderboard */}
        {!loading && !error && leaderboardData[activeTab]?.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-sky-500 text-white p-4">
              <h2 className="text-xl font-semibold">Full Rankings</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {leaderboardData[activeTab].map((user) => (
                <div key={user.rank} className="p-4 hover:bg-white/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {getRankIcon(user.rank)}
                        <span className="text-2xl font-bold text-gray-700 w-8">#{user.rank}</span>
                      </div>
                      
                      <div className="text-3xl">{user.avatar}</div>
                      
                      <div>
                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                          {user.name}
                          <span className="text-lg">{user.badge}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          🔥 {user.streak} day streak
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-sky-600">{user.hours}h</div>
                      <div className="text-sm text-gray-600">study time</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Your Stats */}
        {userRank && (
          <div className="mt-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Your Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">#{userRank.rank}</div>
                <div className="text-sky-100">Current Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userRank.hours}h</div>
                <div className="text-sky-100">Study Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userRank.streak}</div>
                <div className="text-sky-100">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userRank.rankChange > 0 ? '+' : ''}{userRank.rankChange}</div>
                <div className="text-sky-100">Rank Change</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaderboardPage