'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Briefcase, 
  Users, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  DollarSign,
  Target,
  MoreHorizontal,
  Star,
  Activity,
  Building2,
  Lightbulb,
  Globe,
  BarChart3,
  FileText,
  Network,
  Settings,
  Plus,
  Edit,
  Share2
} from 'lucide-react'

interface Venture {
  id: string
  name: string
  purpose: string
  region: string
  status: 'ACTIVE' | 'PLANNING' | 'INACTIVE'
  createdAt: string
  teamCount: number
  projectCount: number
  revenue: number
  growth: number
  ideasCount?: number
  legalDocumentsCount?: number
  umbrellaRelationshipsCount?: number
}

interface Project {
  id: string
  name: string
  summary: string
  totalValue: number
  completionRate: number
  status: string
  createdAt: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  joinedAt: string
  contributions: number
}

export default function VentureDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [venture, setVenture] = useState<Venture | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (params.id) {
      loadVentureDetails(params.id as string)
    }
  }, [params.id])

  const loadVentureDetails = async (ventureId: string) => {
    try {
      setLoading(true)
      
      // Mock data based on our database
      const ventureData: Venture = {
        id: ventureId,
        name: ventureId === 'admin-venture-1' ? 'TechInnovate Solutions' : 
              ventureId === 'admin-venture-2' ? 'GreenFuture Energy' : 'DataFlow Analytics',
        purpose: ventureId === 'admin-venture-1' ? 'Developing cutting-edge technology solutions for modern businesses' :
                 ventureId === 'admin-venture-2' ? 'Sustainable energy solutions and environmental technology' :
                 'Advanced data analytics and business intelligence platforms',
        region: ventureId === 'admin-venture-1' ? 'North America' :
                ventureId === 'admin-venture-2' ? 'Global' : 'Europe',
        status: ventureId === 'admin-venture-3' ? 'PLANNING' : 'ACTIVE',
        createdAt: '2025-09-09T17:59:05.844Z',
        teamCount: 9,
        projectCount: 3,
        revenue: ventureId === 'admin-venture-1' ? 75000 :
                 ventureId === 'admin-venture-2' ? 100000 : 50000,
        growth: ventureId === 'admin-venture-1' ? 15 :
                ventureId === 'admin-venture-2' ? 22 : 0,
        ideasCount: ventureId === 'admin-venture-1' ? 2 : 1,
        legalDocumentsCount: 1,
        umbrellaRelationshipsCount: 1
      }
      
      setVenture(ventureData)
      
      // Mock projects data
      const projectsData: Project[] = [
        {
          id: 'project-1',
          name: ventureId === 'admin-venture-1' ? 'AI-Powered Analytics Platform' :
                ventureId === 'admin-venture-2' ? 'Blockchain Supply Chain' : 'Green Energy Solutions',
          summary: 'Revolutionary platform using advanced technology',
          totalValue: ventureId === 'admin-venture-1' ? 50000 :
                      ventureId === 'admin-venture-2' ? 75000 : 100000,
          completionRate: ventureId === 'admin-venture-1' ? 75 :
                          ventureId === 'admin-venture-2' ? 60 : 45,
          status: 'ACTIVE',
          createdAt: '2025-09-09T17:59:05.844Z'
        }
      ]
      
      setProjects(projectsData)
      
      // Mock team members data
      const teamData: TeamMember[] = [
        {
          id: 'member-1',
          name: 'Test Admin',
          role: 'LEAD',
          joinedAt: '2025-09-09T17:59:05.844Z',
          contributions: 25
        },
        {
          id: 'member-2',
          name: 'Test User',
          role: 'SENIOR',
          joinedAt: '2025-09-09T17:59:05.844Z',
          contributions: 18
        },
        {
          id: 'member-3',
          name: 'test@test.com',
          role: 'MEMBER',
          joinedAt: '2025-09-09T17:59:05.844Z',
          contributions: 12
        }
      ]
      
      setTeamMembers(teamData)
      
    } catch (error) {
      console.error('Error loading venture details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      ACTIVE: { color: 'bg-green-100 text-green-800', text: 'Active' },
      PLANNING: { color: 'bg-yellow-100 text-yellow-800', text: 'Planning' },
      INACTIVE: { color: 'bg-gray-100 text-gray-800', text: 'Inactive' }
    }
    const { color, text } = config[status as keyof typeof config] || config.INACTIVE
    return <Badge className={color}>{text}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!venture) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Venture not found</h1>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen wonderland-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          <div>
              <h1 className="text-3xl font-bold text-foreground">{venture.name}</h1>
              <p className="text-foreground-muted mt-1">{venture.purpose}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="glass-button">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button className="glass-button">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button className="glass-button">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-foreground-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(venture.revenue)}</div>
              <p className="text-xs text-foreground-muted mt-1">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Team Members</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{venture.teamCount}</div>
              <p className="text-xs text-foreground-muted mt-1">Active contributors</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Projects</CardTitle>
              <Target className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{venture.projectCount}</div>
              <p className="text-xs text-foreground-muted mt-1">In progress</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">+{venture.growth}%</div>
              <p className="text-xs text-foreground-muted mt-1">This quarter</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Venture Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                <div>
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <div className="mt-1">{getStatusBadge(venture.status)}</div>
                </div>
                <div>
                        <label className="text-sm font-medium text-gray-600">Region</label>
                        <div className="mt-1 flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 mr-1" />
                          {venture.region}
                </div>
                </div>
              </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Created</label>
                      <div className="mt-1 flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(venture.createdAt)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="mt-1 text-sm text-gray-900">{venture.purpose}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Plus className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">New project created</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                      <div>
                          <p className="text-sm font-medium text-gray-900">Team member joined</p>
                          <p className="text-xs text-gray-500">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-6 mt-6">
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Projects</CardTitle>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <Target className="w-5 h-5 text-white" />
                            </div>
                      <div>
                              <h3 className="font-medium text-gray-900">{project.name}</h3>
                              <p className="text-sm text-gray-600">{project.summary}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{formatCurrency(project.totalValue)}</div>
                              <div className="text-xs text-gray-500">{project.completionRate}% complete</div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <ArrowLeft className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team" className="space-y-6 mt-6">
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Team Members</CardTitle>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Invite Member
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{member.name}</h3>
                              <p className="text-sm text-gray-600">{member.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{member.contributions} contributions</div>
                            <div className="text-xs text-gray-500">Joined {formatDate(member.joinedAt)}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Venture Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                      <p className="text-gray-600">Detailed analytics and insights will be available here.</p>
              </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">Ideas</span>
                  </div>
                  <span className="font-medium">{venture.ideasCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Legal Docs</span>
                  </div>
                  <span className="font-medium">{venture.legalDocumentsCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">Network</span>
              </div>
                  <span className="font-medium">{venture.umbrellaRelationshipsCount || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Revenue milestone reached</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">New team member joined</p>
                    <p className="text-xs text-gray-500">1 week ago</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Project completed</p>
                    <p className="text-xs text-gray-500">2 weeks ago</p>
                </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}