'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../components/AppLayout'
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
  const router = useRouter()

  useEffect(() => {
    // Get user data from cookies
    const getUserFromCookies = () => {
      const cookies = document.cookie.split(';')
      const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='))
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))
      
      if (!userCookie || !tokenCookie) {
        router.push('/login')
        return
      }

      try {
        const userData = JSON.parse(userCookie.split('=')[1])
        setUser(userData)
        
        // Fetch channels and messages data
        fetchChannelsData()
        fetchMessagesData('general')
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    }

    getUserFromCookies()
  }, [router])

  const fetchChannelsData = () => {
    // Mock channels data
    const mockChannels: Channel[] = [
      {
        id: 'general',
        name: 'General',
        description: 'General community discussions',
        type: 'general',
        unreadCount: 0,
        lastMessage: 'Welcome to SmartStart!',
        lastMessageTime: '2024-01-30T10:00:00Z'
      },
      {
        id: 'announcements',
        name: 'Announcements',
        description: 'Important updates and announcements',
        type: 'announcement',
        unreadCount: 2,
        lastMessage: 'New platform features released',
        lastMessageTime: '2024-01-30T09:30:00Z'
      },
      {
        id: 'smartstart-platform',
        name: 'SmartStart Platform',
        description: 'Development discussions for the core platform',
        type: 'project',
        unreadCount: 5,
        lastMessage: 'RBAC system implementation complete',
        lastMessageTime: '2024-01-30T08:45:00Z'
      },
      {
        id: 'ai-marketing-tool',
        name: 'AI Marketing Tool',
        description: 'AI-powered marketing automation project',
        type: 'project',
        unreadCount: 1,
        lastMessage: 'User interface mockups ready',
        lastMessageTime: '2024-01-29T16:20:00Z'
      },
      {
        id: 'random',
        name: 'Random',
        description: 'Off-topic discussions and fun',
        type: 'random',
        unreadCount: 0,
        lastMessage: 'Anyone up for a game night?',
        lastMessageTime: '2024-01-29T14:15:00Z'
      }
    ]
    
    setChannels(mockChannels)
  }

  const fetchMessagesData = (channelId: string) => {
    // Mock messages data
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Welcome to SmartStart! This is where our community comes together to build amazing things.',
        sender: {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@smartstart.com',
          role: 'ADMIN'
        },
        timestamp: '2024-01-30T10:00:00Z',
        type: 'announcement',
        reactions: [
          { emoji: '👋', count: 8, users: ['user1', 'user2', 'user3'] },
          { emoji: '🚀', count: 5, users: ['user4', 'user5'] }
        ]
      },
      {
        id: '2',
        content: 'Excited to be part of this community! Looking forward to contributing to some projects.',
        sender: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@demo.local',
          role: 'CONTRIBUTOR'
        },
        timestamp: '2024-01-30T10:05:00Z',
        type: 'text',
        reactions: [
          { emoji: '👍', count: 3, users: ['user2', 'user3'] }
        ]
      },
      {
        id: '3',
        content: 'Great to have you here, John! Check out the projects section to see what we\'re working on.',
        sender: {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@demo.local',
          role: 'OWNER'
        },
        timestamp: '2024-01-30T10:08:00Z',
        type: 'text',
        reactions: []
      },
      {
        id: '4',
        content: 'I\'ve been working on the RBAC system for the past week. It\'s coming along nicely!',
        sender: {
          id: 'user-3',
          name: 'Mike Developer',
          email: 'mike@demo.local',
          role: 'CONTRIBUTOR'
        },
        timestamp: '2024-01-30T10:12:00Z',
        type: 'text',
        reactions: [
          { emoji: '💻', count: 2, users: ['user1', 'user4'] },
          { emoji: '🎯', count: 1, users: ['user2'] }
        ]
      },
      {
        id: '5',
        content: 'That sounds amazing! Can\'t wait to see it in action. The current permission system could definitely use an upgrade.',
        sender: {
          id: 'user-4',
          name: 'Sarah Manager',
          email: 'sarah@demo.local',
          role: 'ADMIN'
        },
        timestamp: '2024-01-30T10:15:00Z',
        type: 'text',
        reactions: [
          { emoji: '🙌', count: 4, users: ['user1', 'user2', 'user3'] }
        ]
      }
    ]
    
    setMessages(mockMessages)
  }

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId)
    fetchMessagesData(channelId)
    
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
