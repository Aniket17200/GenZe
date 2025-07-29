import { useState, useEffect, useCallback } from 'react'
import { Heart, MessageCircle, Share2, Pin, Clock, Trophy, Flame, Target, AlertCircle, Bookmark, Repeat, Send } from 'lucide-react'
import { apiService } from '../lib/api'
import Navbar from './Navbar'
import LoadingSpinner from './LoadingSpinner'

const SocialFeedPage = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newPost, setNewPost] = useState('')
  const [expandedComments, setExpandedComments] = useState(new Set())
  const [postComments, setPostComments] = useState({})
  const [newComments, setNewComments] = useState({})
  const [loadingComments, setLoadingComments] = useState(new Set())
  const [showLikers, setShowLikers] = useState(null)
  const [likers, setLikers] = useState([])
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set())

  // Initialize bookmarked posts from API data
  useEffect(() => {
    const bookmarked = new Set()
    posts.forEach(post => {
      if (post.isBookmarked) {
        bookmarked.add(post.id)
      }
    })
    setBookmarkedPosts(bookmarked)
  }, [posts])

  useEffect(() => {
    loadFeedPosts()
  }, [])

  // Prevent data loss on re-renders
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  useEffect(() => {
    if (isInitialLoad && posts.length > 0) {
      setIsInitialLoad(false)
    }
  }, [posts, isInitialLoad])

  const loadFeedPosts = async (refresh = false) => {
    try {
      if (refresh || posts.length === 0) {
        setLoading(true)
      }
      const data = await apiService.getFeedPosts()
      if (refresh) {
        setPosts(data)
      } else {
        // Merge new posts with existing ones, avoiding duplicates
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(p => p.id))
          const newPosts = data.filter(p => !existingIds.has(p.id))
          return prevPosts.length === 0 ? data : [...newPosts, ...prevPosts]
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return
    
    // Optimistic update
    const newLikeStatus = !post.isLiked
    const newLikeCount = newLikeStatus ? post.likesCount + 1 : post.likesCount - 1
    
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, likesCount: newLikeCount, isLiked: newLikeStatus }
        : p
    ))
    
    try {
      const response = await apiService.likePost(postId)
      // Update with actual server response
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, likesCount: response.likes, isLiked: response.isLiked }
          : p
      ))
    } catch (err) {
      // Revert optimistic update on error
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, likesCount: post.likesCount, isLiked: post.isLiked }
          : p
      ))
      setError(err.message)
      setTimeout(() => setError(null), 5000)
    }
  }



  const handlePost = useCallback(async () => {
    if (!newPost.trim()) return
    
    const postContent = newPost.trim()
    setNewPost('')
    
    // Optimistic update
    const tempPost = {
      id: 'temp-' + Date.now(),
      content: postContent,
      user: { name: 'You', avatar: '👤', badge: '🌟', streak: 0 },
      timestamp: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isBookmarked: false,
      isTemp: true
    }
    setPosts(prev => [tempPost, ...prev])
    
    try {
      const post = await apiService.createPost(postContent)
      setPosts(prev => prev.map(p => p.id === tempPost.id ? post : p))
    } catch (err) {
      setPosts(prev => prev.filter(p => p.id !== tempPost.id))
      setError(err.message)
      setTimeout(() => setError(null), 5000)
    }
  }, [newPost])

  const handleCommentLike = async (commentId, postId) => {
    // Optimistic update
    const currentComment = postComments[postId]?.find(c => c.id === commentId)
    if (!currentComment) return
    
    const newLikeStatus = !currentComment.isLiked
    const newLikeCount = newLikeStatus ? (currentComment.likesCount || 0) + 1 : Math.max(0, (currentComment.likesCount || 0) - 1)
    
    setPostComments(prev => ({
      ...prev,
      [postId]: prev[postId]?.map(comment => 
        comment.id === commentId 
          ? { ...comment, likesCount: newLikeCount, isLiked: newLikeStatus }
          : comment
      )
    }))
    
    try {
      const response = await apiService.likeComment(commentId)
      // Update with server response
      setPostComments(prev => ({
        ...prev,
        [postId]: prev[postId]?.map(comment => 
          comment.id === commentId 
            ? { ...comment, likesCount: response.likes, isLiked: response.isLiked }
            : comment
        )
      }))
    } catch (err) {
      // Revert on error
      setPostComments(prev => ({
        ...prev,
        [postId]: prev[postId]?.map(comment => 
          comment.id === commentId 
            ? { ...comment, likesCount: currentComment.likesCount, isLiked: currentComment.isLiked }
            : comment
        )
      }))
      setError('Failed to like comment')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleBookmark = async (postId) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return
    
    // Optimistic update
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, isBookmarked: !p.isBookmarked }
        : p
    ))
    
    try {
      const response = await apiService.bookmarkPost(postId)
      // Update with server response if needed
    } catch (err) {
      // Revert on error
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, isBookmarked: post.isBookmarked }
          : p
      ))
      setError('Failed to bookmark post')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleRepost = async (postId) => {
    try {
      const response = await apiService.repostPost(postId)
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, sharesCount: (response.reposts || p.sharesCount + 1) }
          : p
      ))
    } catch (err) {
      setError('Failed to repost')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleShare = async (postId) => {
    try {
      // Copy post link to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
      setError('Link copied to clipboard!')
      setTimeout(() => setError(null), 2000)
    } catch (err) {
      setError('Failed to copy link')
      setTimeout(() => setError(null), 3000)
    }
  }

  const showPostLikers = async (postId) => {
    try {
      const postLikers = await apiService.getPostLikers(postId)
      setLikers(postLikers)
      setShowLikers(postId)
    } catch (err) {
      setError('Failed to load likers')
      setTimeout(() => setError(null), 3000)
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)
    
    if (diffInSeconds < 60) return 'now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
    return time.toLocaleDateString()
  }

  const toggleComments = async (postId) => {
    const isExpanded = expandedComments.has(postId)
    
    if (isExpanded) {
      setExpandedComments(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    } else {
      setExpandedComments(prev => new Set(prev).add(postId))
      
      if (!postComments[postId]) {
        setLoadingComments(prev => new Set(prev).add(postId))
        
        try {
          const comments = await apiService.getPostComments(postId)
          setPostComments(prev => ({ ...prev, [postId]: comments }))
        } catch (err) {
          console.error('Failed to load comments:', err)
          setPostComments(prev => ({ ...prev, [postId]: [] }))
        } finally {
          setLoadingComments(prev => {
            const newSet = new Set(prev)
            newSet.delete(postId)
            return newSet
          })
        }
      }
    }
  }

  const handleAddComment = async (postId) => {
    const commentText = newComments[postId]?.trim()
    if (!commentText) return
    
    // Clear input immediately for better UX
    setNewComments(prev => ({ ...prev, [postId]: '' }))
    
    try {
      const comment = await apiService.addComment(postId, commentText)
      
      // Add comment to local state
      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment]
      }))
      
      // Update comment count in posts
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
          : p
      ))
      
      console.log('Comment added successfully:', comment)
    } catch (err) {
      console.error('Comment error:', err)
      // Restore input text on error
      setNewComments(prev => ({ ...prev, [postId]: commentText }))
      setError('Failed to add comment: ' + (err.message || 'Unknown error'))
      setTimeout(() => setError(null), 5000)
    }
  }

  const getPostIcon = (type) => {
    switch(type) {
      case 'achievement': return <Trophy className="text-yellow-500" size={20} />
      case 'milestone': return <Flame className="text-orange-500" size={20} />
      case 'tip': return <Target className="text-blue-500" size={20} />
      case 'collaboration': return <MessageCircle className="text-green-500" size={20} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Social Feed</h1>
          <p className="text-gray-600">Connect with the global study community</p>
        </div>

        {/* Create Post */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex gap-4">
            <div className="text-3xl">👤</div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your study progress, tips, or motivation with the community..."
                className="form-textarea"
                rows="3"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {newPost.length}/500 characters
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Share your study journey with 10,000+ students
                </div>
                <button
                  onClick={handlePost}
                  disabled={!newPost.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {newPost.trim() ? 'Post' : 'Write something...'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
            <p className="text-gray-600">Be the first to share something with the community!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{post.user?.avatar || '👤'}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{post.user?.name || 'User'}</span>
                        <span className="text-lg">{post.user?.badge || '🌟'}</span>
                        {getPostIcon(post.type)}
                        {post.isTemp && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Posting...</span>}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>{formatTimeAgo(post.timestamp)}</span>
                        {post.user?.streak > 0 && (
                          <span className="text-orange-600 font-medium">
                            🔥 {post.user.streak} day streak
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  

                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  
                  {/* Achievement Badge */}
                  {post.type === 'achievement' && post.studyTime && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      <Trophy size={14} />
                      Study Time: {post.studyTime}
                    </div>
                  )}
                  
                  {/* Milestone Badge */}
                  {post.type === 'milestone' && post.achievement && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                      <Flame size={14} />
                      {post.achievement}
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1 transition-all transform hover:scale-110 ${
                          post.isLiked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'
                        }`}
                        disabled={post.isTemp}
                      >
                        <Heart 
                          size={20} 
                          fill={post.isLiked ? 'currentColor' : 'none'} 
                          className={post.isLiked ? 'animate-pulse' : ''}
                        />
                      </button>
                      
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className="text-gray-700 hover:text-blue-500 transition-all transform hover:scale-110"
                      >
                        <MessageCircle size={20} />
                      </button>
                      
                      <button 
                        onClick={() => handleRepost(post.id)}
                        className="text-gray-700 hover:text-green-500 transition-all transform hover:scale-110"
                        title="Repost"
                      >
                        <Repeat size={20} />
                      </button>
                      
                      <button 
                        onClick={() => handleShare(post.id)}
                        className="text-gray-700 hover:text-blue-500 transition-all transform hover:scale-110"
                        title="Share"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleBookmark(post.id)}
                      className={`transition-all transform hover:scale-110 ${
                        post.isBookmarked ? 'text-yellow-500' : 'text-gray-700 hover:text-yellow-500'
                      }`}
                    >
                      <Bookmark size={20} fill={post.isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  
                  {/* Like count with clickable likers */}
                  {post.likesCount > 0 && (
                    <button 
                      onClick={() => showPostLikers(post.id)}
                      className="text-sm font-semibold text-gray-900 hover:text-sky-600 mb-1 block"
                    >
                      {post.likesCount === 1 ? '1 like' : `${post.likesCount.toLocaleString()} likes`}
                    </button>
                  )}
                  
                  {/* View comments button */}
                  {post.commentsCount > 0 && !expandedComments.has(post.id) && (
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="text-sm text-gray-500 hover:text-gray-700 mb-2 block"
                    >
                      View all {post.commentsCount} comments
                    </button>
                  )}
                  
                  {/* Time ago */}
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {formatTimeAgo(post.timestamp)}
                  </div>
                </div>

                {/* Inline Comments Section */}
                {expandedComments.has(post.id) && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    {/* Comments List */}
                    <div className="space-y-3 mb-4">
                      {loadingComments.has(post.id) ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-sky-200 border-t-sky-500"></div>
                        </div>
                      ) : (postComments[post.id] || []).length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">No comments yet. Be the first to comment!</p>
                        </div>
                      ) : (
                        (postComments[post.id] || []).map((comment) => (
                          <div key={comment.id} className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">{comment.user?.name?.charAt(0)?.toUpperCase() || '👤'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                                <p className="font-semibold text-sm text-gray-800">{comment.user?.name || 'User'}</p>
                                <p className="text-gray-700 text-sm break-words">{comment.content}</p>
                              </div>
                              <div className="flex items-center gap-4 mt-1 ml-4">
                                <span className="text-xs text-gray-500">{formatTimeAgo(comment.timestamp)}</span>
                                <button 
                                  onClick={() => handleCommentLike(comment.id, post.id)}
                                  className={`text-xs font-medium transition-colors ${
                                    comment.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                                  }`}
                                >
                                  {comment.likesCount > 0 ? `${comment.likesCount} likes` : 'Like'}
                                </button>
                                <button className="text-xs text-gray-600 hover:text-sky-600 font-medium">Reply</button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment Input */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">👤</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newComments[post.id] || ''}
                            onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Write a comment..."
                            className="flex-1 px-4 py-2 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                            maxLength={500}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleAddComment(post.id)
                              }
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!newComments[post.id]?.trim()}
                            className="text-sky-500 hover:text-sky-600 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold text-sm px-2"
                          >
                            Post
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 ml-4">
                          {(newComments[post.id] || '').length}/500
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Community Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white text-center">
            <div className="text-3xl font-bold mb-2">{posts.reduce((sum, post) => sum + (post.likesCount || 0), 0)}</div>
            <div className="text-purple-100">Total Likes</div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white text-center">
            <div className="text-3xl font-bold mb-2">{posts.length}</div>
            <div className="text-blue-100">Posts Shared</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white text-center">
            <div className="text-3xl font-bold mb-2">{posts.reduce((sum, post) => sum + (post.commentsCount || 0), 0)}</div>
            <div className="text-green-100">Total Comments</div>
          </div>
        </div>


      </div>
    </div>
  )
}

export default SocialFeedPage