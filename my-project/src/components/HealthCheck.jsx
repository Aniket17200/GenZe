import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'
import { apiService } from '../lib/api'

const HealthCheck = () => {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState(null)

  const checkHealth = async () => {
    try {
      setLoading(true)
      const response = await apiService.healthCheck()
      setHealth(response)
      setLastCheck(new Date())
    } catch (error) {
      setHealth({ 
        status: 'ERROR', 
        error: error.message,
        timestamp: new Date()
      })
      setLastCheck(new Date())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="animate-spin text-blue-500" size={24} />
    if (health?.status === 'OK') return <CheckCircle className="text-green-500" size={24} />
    return <XCircle className="text-red-500" size={24} />
  }

  const getStatusColor = () => {
    if (loading) return 'border-blue-200 bg-blue-50'
    if (health?.status === 'OK') return 'border-green-200 bg-green-50'
    return 'border-red-200 bg-red-50'
  }

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h3 className="font-semibold">System Health</h3>
        </div>
        <button 
          onClick={checkHealth}
          disabled={loading}
          className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>API Status:</span>
          <span className={health?.status === 'OK' ? 'text-green-600' : 'text-red-600'}>
            {health?.status || 'Unknown'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Database:</span>
          <span className={health?.database === 'Connected' ? 'text-green-600' : 'text-red-600'}>
            {health?.database || 'Unknown'}
          </span>
        </div>
        
        {lastCheck && (
          <div className="flex justify-between">
            <span>Last Check:</span>
            <span className="text-gray-600">
              {lastCheck.toLocaleTimeString()}
            </span>
          </div>
        )}
        
        {health?.error && (
          <div className="mt-2 p-2 bg-red-100 rounded text-red-700 text-xs">
            {health.error}
          </div>
        )}
      </div>
    </div>
  )
}

export default HealthCheck