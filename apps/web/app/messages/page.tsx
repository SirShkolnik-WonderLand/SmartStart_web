'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../components/AppLayout'
import { apiCallWithAuth } from '../utils/api'
import '../styles/messages.css'

interface User {
  id: string
  email: string
  role: string
  name?: string
}

interface Channel {
  id: string
  name: string
  description: string
  type: 'general' | 'project' | 'announcement' | 'random'
  unreadCount: number
  lastMessage?: string
  lastMessageTime?: string
}

interface Message {
  id: string
  content: string
  sender: {
    id: string
    name: string
    email: string
    role: string
  }
  timestamp: string
  type: 'text' | 'system' | 'announcement'
  reactions: Array<{
    emoji: string
    count: number
    users: string[]
  }>
}

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string>('general')
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [authToken, setAuthToken] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    // Get user data from cookies
    const getUserFromCookies = async () => {
      const cookies = document.cookie.split(';')
      const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='))
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))
      
      if (!userCookie || !tokenCookie) {
        router.push('/login')
        return
      }

      try {
        const userData = JSON.parse(userCookie.split('=')[1])
        const token = tokenCookie.split('=')[1]
        setUser(userData)
        setAuthToken(token)
        
        // Fetch channels and messages data
        await fetchChannelsData(token)
        await fetchMessagesData('general', token)
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    }

    getUserFromCookies()
  }, [router])

  const fetchChannelsData = async (token: string) => {
    try {
      // Fetch real channels data from API
      const channelsResponse = await apiCallWithAuth('/messages/channels', token)
      
      if (channelsResponse && Array.isArray(channelsResponse)) {
        // Transform API data to match our interface
        const realChannels: Channel[] = channelsResponse.map((channel: any) => ({
          id: channel.id,
          name: channel.name || 'Unnamed Channel',
          description: channel.description || 'No description available',
          type: channel.type || 'general',
          unreadCount: channel.unreadCount || 0,
          lastMessage: channel.lastMessage || 'No messages yet',
          lastMessageTime: channel.lastMessageTime || channel.updatedAt || new Date().toISOString()
        }))
        
        setChannels(realChannels)
      } else {
        // Fallback to default channels if API fails
        const defaultChannels: Channel[] = [
          {
            id: 'general',
            name: 'General',
            description: 'General community discussions',
            type: 'general',
            unreadCount: 0,
            lastMessage: 'Welcome to SmartStart!',
            lastMessageTime: new Date().toISOString()
          }
        ]
        setChannels(defaultChannels)
      }
    } catch (error) {
      console.error('Error fetching channels data:', error)
      // Fallback to default channels if API fails
      const defaultChannels: Channel[] = [
        {
          id: 'general',
          name: 'General',
          description: 'General community discussions',
          type: 'general',
          unreadCount: 0,
          lastMessage: 'Welcome to SmartStart!',
          lastMessageTime: new Date().toISOString()
        }
      ]
      setChannels(defaultChannels)
    }
  }

  const fetchMessagesData = async (channelId: string, token: string) => {
    try {
      // Fetch real messages data from API
      const messagesResponse = await apiCallWithAuth(`/messages/${channelId}`, token)
      
      if (messagesResponse && Array.isArray(messagesResponse)) {
        // Transform API data to match our interface
        const realMessages: Message[] = messagesResponse.map((message: any) => ({
          id: message.id,
          content: message.content || message.body || 'No content',
          sender: {
            id: message.senderId || message.authorId || 'unknown',
            name: message.sender?.name || message.author?.name || 'Unknown User',
            email: message.sender?.email || message.author?.email || 'unknown@example.com',
            role: message.sender?.role || message.author?.role || 'MEMBER'
          },
          timestamp: message.createdAt || message.timestamp || new Date().toISOString(),
          type: message.type || 'text',
          reactions: message.reactions || []
        }))
        
        setMessages(realMessages)
      } else {
        // Fallback to empty array if API fails
        setMessages([])
      }
    } catch (error) {
      console.error('Error fetching messages data:', error)
      // Fallback to empty array if API fails
      setMessages([])
    }
  }

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId)
    fetchMessagesData(channelId, authToken)
    
    // Mark channel as read
    setChannels(prev => 
      prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, unreadCount: 0 }
          : channel
      )
    )
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !user) return
    
    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: {
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        role: user.role
      },
      timestamp: new Date().toISOString(),
      type: 'text',
      reactions: []
    }
    
    setMessages(prev => [...prev, message])
    setNewMessage('')
    
    // Update channel last message
    setChannels(prev => 
      prev.map(channel => 
        channel.id === selectedChannel 
          ? { 
              ...channel, 
              lastMessage: newMessage,
              lastMessageTime: new Date().toISOString()
            }
          : channel
      )
    )
  }

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => 
      prev.map(message => {
        if (message.id === messageId) {
          const existingReaction = message.reactions.find(r => r.emoji === emoji)
          
          if (existingReaction) {
            return {
              ...message,
              reactions: message.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count + 1, users: [...r.users, user?.id || 'unknown'] }
                  : r
              )
            }
          } else {
            return {
              ...message,
              reactions: [...message.reactions, { 
                emoji, 
                count: 1, 
                users: [user?.id || 'unknown'] 
              }]
            }
          }
        }
        return message
      })
    )
  }

  if (loading) {
    return (
      <AppLayout currentPage="/messages">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading Team Messages...</span>
        </div>
      </AppLayout>
    )
  }

  if (!user) {
    return (
      <AppLayout currentPage="/messages">
        <div className="error-container">
          <h3>Access Denied</h3>
          <p>Please log in to view team messages.</p>
        </div>
      </AppLayout>
    )
  }

  const currentChannel = channels.find(c => c.id === selectedChannel)

  return (
    <AppLayout currentPage="/messages">
      <div className="page-header">
        <h1 className="page-title">Team Messages</h1>
        <p className="page-subtitle">Stay connected with your team and community</p>
      </div>

      <div className="messages-container">
        {/* Channels Sidebar */}
        <div className="channels-sidebar">
          <div className="channels-header">
            <h3 className="channels-title">Channels</h3>
          </div>
          
          <div className="channels-list">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => handleChannelSelect(channel.id)}
                className={`channel-item ${selectedChannel === channel.id ? 'active' : ''}`}
              >
                <div className="channel-info">
                  <span className={`channel-type channel-type-${channel.type}`}>
                    {channel.type === 'general' && '#'}
                    {channel.type === 'announcement' && '📢'}
                    {channel.type === 'project' && '🚀'}
                    {channel.type === 'random' && '🎲'}
                  </span>
                  <span className="channel-name">{channel.name}</span>
                </div>
                
                {channel.unreadCount > 0 && (
                  <span className="unread-badge">{channel.unreadCount}</span>
                )}
                
                {channel.lastMessage && (
                  <div className="channel-preview">
                    <span className="channel-last-message">{channel.lastMessage}</span>
                    <span className="channel-last-time">
                      {new Date(channel.lastMessageTime!).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          {currentChannel && (
            <>
              {/* Channel Header */}
              <div className="channel-header">
                <div className="channel-header-info">
                  <span className={`channel-type-large channel-type-${currentChannel.type}`}>
                    {currentChannel.type === 'general' && '#'}
                    {currentChannel.type === 'announcement' && '📢'}
                    {currentChannel.type === 'project' && '🚀'}
                    {currentChannel.type === 'random' && '🎲'}
                  </span>
                  <h2 className="channel-name-large">{currentChannel.name}</h2>
                  <p className="channel-description">{currentChannel.description}</p>
                </div>
              </div>

              {/* Messages List */}
              <div className="messages-list">
                {messages.map((message) => (
                  <div key={message.id} className="message-item">
                    <div className="message-avatar">
                      {message.sender.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-sender">{message.sender.name}</span>
                        <span className="message-role">{message.sender.role}</span>
                        <span className="message-time">
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      
                      <div className="message-text">{message.content}</div>
                      
                      {message.reactions.length > 0 && (
                        <div className="message-reactions">
                          {message.reactions.map((reaction, index) => (
                            <button
                              key={index}
                              onClick={() => handleReaction(message.id, reaction.emoji)}
                              className="reaction-button"
                            >
                              <span className="reaction-emoji">{reaction.emoji}</span>
                              <span className="reaction-count">{reaction.count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="message-input-form">
                <div className="message-input-container">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message #${currentChannel.name}`}
                    className="message-input"
                  />
                  <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
