import { socketService } from './socket'

class WebRTCService {
  constructor() {
    this.localStream = null
    this.peerConnections = new Map()
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ]
    }
    this.isInitialized = false
    this.eventListeners = {}
  }

  // Event emitter functionality
  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data))
    }
  }

  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(callback)
  }

  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback)
    }
  }

  // Initialize WebRTC
  async initialize() {
    if (this.isInitialized) return true

    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      console.log('✅ Local stream obtained')
      this.emit('localStream', this.localStream)

      // Setup socket listeners for WebRTC signaling
      this.setupSocketListeners()
      
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('❌ Failed to get user media:', error)
      this.emit('error', { type: 'media', error })
      return false
    }
  }

  // Setup socket event listeners
  setupSocketListeners() {
    socketService.on('userJoined', (userData) => {
      console.log('User joined, creating peer connection:', userData.socketId)
      this.createPeerConnection(userData.socketId, true)
    })

    socketService.on('userLeft', (userData) => {
      console.log('User left, removing peer connection:', userData.socketId)
      this.removePeerConnection(userData.socketId)
    })

    socketService.on('webrtcSignal', async (data) => {
      console.log('WebRTC signal received:', data.signal.type)
      await this.handleSignal(data.signal, data.fromSocketId)
    })
  }

  // Create peer connection
  async createPeerConnection(socketId, isInitiator = false) {
    try {
      const peerConnection = new RTCPeerConnection(this.configuration)
      
      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream)
        })
      }

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Remote stream received from:', socketId)
        const remoteStream = event.streams[0]
        this.emit('remoteStream', { socketId, stream: remoteStream })
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate to:', socketId)
          socketService.sendWebRTCSignal({
            type: 'ice-candidate',
            candidate: event.candidate
          }, socketId)
        }
      }

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state changed:', peerConnection.connectionState)
        this.emit('connectionStateChange', {
          socketId,
          state: peerConnection.connectionState
        })

        if (peerConnection.connectionState === 'failed') {
          this.removePeerConnection(socketId)
        }
      }

      this.peerConnections.set(socketId, peerConnection)

      // If initiator, create and send offer
      if (isInitiator) {
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        
        console.log('Sending offer to:', socketId)
        socketService.sendWebRTCSignal({
          type: 'offer',
          offer: offer
        }, socketId)
      }

      return peerConnection
    } catch (error) {
      console.error('Failed to create peer connection:', error)
      this.emit('error', { type: 'peerConnection', error, socketId })
      return null
    }
  }

  // Handle WebRTC signals
  async handleSignal(signal, fromSocketId) {
    try {
      let peerConnection = this.peerConnections.get(fromSocketId)

      // Create peer connection if it doesn't exist
      if (!peerConnection) {
        peerConnection = await this.createPeerConnection(fromSocketId, false)
        if (!peerConnection) return
      }

      switch (signal.type) {
        case 'offer':
          console.log('Handling offer from:', fromSocketId)
          await peerConnection.setRemoteDescription(signal.offer)
          
          const answer = await peerConnection.createAnswer()
          await peerConnection.setLocalDescription(answer)
          
          socketService.sendWebRTCSignal({
            type: 'answer',
            answer: answer
          }, fromSocketId)
          break

        case 'answer':
          console.log('Handling answer from:', fromSocketId)
          await peerConnection.setRemoteDescription(signal.answer)
          break

        case 'ice-candidate':
          console.log('Handling ICE candidate from:', fromSocketId)
          await peerConnection.addIceCandidate(signal.candidate)
          break

        default:
          console.warn('Unknown signal type:', signal.type)
      }
    } catch (error) {
      console.error('Error handling WebRTC signal:', error)
      this.emit('error', { type: 'signaling', error, socketId: fromSocketId })
    }
  }

  // Remove peer connection
  removePeerConnection(socketId) {
    const peerConnection = this.peerConnections.get(socketId)
    if (peerConnection) {
      peerConnection.close()
      this.peerConnections.delete(socketId)
      this.emit('peerDisconnected', socketId)
      console.log('Peer connection removed:', socketId)
    }
  }

  // Toggle video
  toggleVideo() {
    if (!this.localStream) return false

    const videoTrack = this.localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      this.emit('videoToggled', videoTrack.enabled)
      return videoTrack.enabled
    }
    return false
  }

  // Toggle audio
  toggleAudio() {
    if (!this.localStream) return false

    const audioTrack = this.localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      this.emit('audioToggled', audioTrack.enabled)
      return audioTrack.enabled
    }
    return false
  }

  // Get local stream
  getLocalStream() {
    return this.localStream
  }

  // Get peer connections
  getPeerConnections() {
    return Array.from(this.peerConnections.keys())
  }

  // Check if video is enabled
  isVideoEnabled() {
    if (!this.localStream) return false
    const videoTrack = this.localStream.getVideoTracks()[0]
    return videoTrack ? videoTrack.enabled : false
  }

  // Check if audio is enabled
  isAudioEnabled() {
    if (!this.localStream) return false
    const audioTrack = this.localStream.getAudioTracks()[0]
    return audioTrack ? audioTrack.enabled : false
  }

  // Cleanup
  cleanup() {
    console.log('Cleaning up WebRTC service')

    // Close all peer connections
    this.peerConnections.forEach((peerConnection, socketId) => {
      peerConnection.close()
    })
    this.peerConnections.clear()

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop()
      })
      this.localStream = null
    }

    // Clear event listeners
    this.eventListeners = {}
    this.isInitialized = false

    this.emit('cleanup')
  }

  // Screen sharing
  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })

      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0]
      this.peerConnections.forEach(async (peerConnection) => {
        const sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        )
        if (sender) {
          await sender.replaceTrack(videoTrack)
        }
      })

      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare()
      }

      this.emit('screenShareStarted', screenStream)
      return screenStream
    } catch (error) {
      console.error('Failed to start screen share:', error)
      this.emit('error', { type: 'screenShare', error })
      return null
    }
  }

  async stopScreenShare() {
    if (!this.localStream) return

    const videoTrack = this.localStream.getVideoTracks()[0]
    if (videoTrack) {
      // Replace screen share track with camera track
      this.peerConnections.forEach(async (peerConnection) => {
        const sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        )
        if (sender) {
          await sender.replaceTrack(videoTrack)
        }
      })
    }

    this.emit('screenShareStopped')
  }
}

export const webrtcService = new WebRTCService()
export default webrtcService