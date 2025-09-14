'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Edit, 
  CheckCircle, 
  Clock,
  AlertCircle,
  User,
  UserCheck,
  MessageSquare,
  Bell,
  Calendar,
  Filter
} from 'lucide-react';

interface RACIActivity {
  id: string;
  activity: string;
  description: string;
  responsible: string;
  accountable: string;
  consulted: string[];
  informed: string[];
  priority: string;
  status: string;
  due_date: string;
  responsible_name: string;
  accountable_name: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  user_name: string;
  role_name: string;
}

interface RACIMatrixManagerProps {
  projectId: string;
}

export default function RACIMatrixManager({ projectId }: RACIMatrixManagerProps) {
  const [activities, setActivities] = useState<RACIActivity[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateActivityOpen, setIsCreateActivityOpen] = useState(false);
  const [isEditActivityOpen, setIsEditActivityOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<RACIActivity | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // Form states
  const [activityData, setActivityData] = useState({
    activity: '',
    description: '',
    responsible: '',
    accountable: '',
    consulted: [] as string[],
    informed: [] as string[],
    priority: 'MEDIUM',
    due_date: ''
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [raciRes, teamRes] = await Promise.all([
        fetch(`/api/venture-legal/raci-matrix/project/${projectId}`),
        fetch(`/api/venture-legal/team/project/${projectId}`)
      ]);

      if (raciRes.ok) {
        const raciData = await raciRes.json();
        setActivities(raciData.data.activities);
      }

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamMembers(teamData.data.team_members);
      }

    } catch (err) {
      setError('Failed to load RACI data');
      console.error('Error loading RACI data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async () => {
    try {
      const response = await fetch('/api/venture-legal/raci-matrix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          user_id: 'current_user', // In real app, get from auth context
          activities: [activityData]
        })
      });

      if (response.ok) {
        await loadData();
        setIsCreateActivityOpen(false);
        setActivityData({
          activity: '',
          description: '',
          responsible: '',
          accountable: '',
          consulted: [],
          informed: [],
          priority: 'MEDIUM',
          due_date: ''
        });
      }
    } catch (err) {
      console.error('Error creating RACI activity:', err);
    }
  };

  const handleUpdateActivityStatus = async (activityId: string, status: string) => {
    try {
      const response = await fetch(`/api/venture-legal/raci-matrix/${activityId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status
        })
      });

      if (response.ok) {
        await loadData();
      }
    } catch (err) {
      console.error('Error updating activity status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'blocked':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredActivities = activities.filter(activity => {
    const statusMatch = filterStatus === 'ALL' || activity.status.toLowerCase() === filterStatus.toLowerCase();
    const priorityMatch = filterPriority === 'ALL' || activity.priority.toLowerCase() === filterPriority.toLowerCase();
    return statusMatch && priorityMatch;
  });

  const getRACIRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'responsible':
        return <User className="h-4 w-4" />;
      case 'accountable':
        return <UserCheck className="h-4 w-4" />;
      case 'consulted':
        return <MessageSquare className="h-4 w-4" />;
      case 'informed':
        return <Bell className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>{error}</p>
        <Button onClick={loadData} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">RACI Matrix</h2>
          <p className="text-gray-400 mt-1">Define responsibilities and accountabilities for project activities</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateActivityOpen} onOpenChange={setIsCreateActivityOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-purple-500 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Add RACI Activity</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="activity" className="text-white">Activity</Label>
                  <Input
                    id="activity"
                    value={activityData.activity}
                    onChange={(e) => setActivityData({...activityData, activity: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Enter activity name..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    value={activityData.description}
                    onChange={(e) => setActivityData({...activityData, description: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={3}
                    placeholder="Enter activity description..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="responsible" className="text-white">Responsible</Label>
                    <Select onValueChange={(value) => setActivityData({...activityData, responsible: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select responsible person" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.user_id} value={member.user_id}>
                            {member.user_name} - {member.role_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="accountable" className="text-white">Accountable</Label>
                    <Select onValueChange={(value) => setActivityData({...activityData, accountable: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select accountable person" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.user_id} value={member.user_id}>
                            {member.user_name} - {member.role_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority" className="text-white">Priority</Label>
                    <Select onValueChange={(value) => setActivityData({...activityData, priority: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="due_date" className="text-white">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={activityData.due_date}
                      onChange={(e) => setActivityData({...activityData, due_date: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
                
                <Button onClick={handleCreateActivity} className="w-full bg-purple-600 hover:bg-purple-700">
                  Add Activity
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-glass border-purple-500">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-white">Filters:</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="status-filter" className="text-gray-400">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="priority-filter" className="text-gray-400">Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RACI Matrix */}
      <Card className="bg-glass border-purple-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>RACI Activities ({filteredActivities.length})</span>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>R</span>
              </div>
              <div className="flex items-center space-x-1">
                <UserCheck className="h-4 w-4" />
                <span>A</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>C</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bell className="h-4 w-4" />
                <span>I</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <h3 className="text-white font-medium">{activity.activity}</h3>
                      {activity.description && (
                        <p className="text-sm text-gray-400">{activity.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getPriorityColor(activity.priority)} text-white`}>
                      {activity.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(activity.status)} text-white`}>
                      {activity.status}
                    </Badge>
                  </div>
                </div>
                
                {/* RACI Roles */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-400 font-medium">Responsible</span>
                    </div>
                    <p className="text-white">
                      {activity.responsible_name || 'Unassigned'}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      <UserCheck className="h-4 w-4 text-green-500" />
                      <span className="text-gray-400 font-medium">Accountable</span>
                    </div>
                    <p className="text-white">
                      {activity.accountable_name || 'Unassigned'}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      <MessageSquare className="h-4 w-4 text-yellow-500" />
                      <span className="text-gray-400 font-medium">Consulted</span>
                    </div>
                    <p className="text-white">
                      {activity.consulted.length > 0 ? activity.consulted.join(', ') : 'None'}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      <Bell className="h-4 w-4 text-purple-500" />
                      <span className="text-gray-400 font-medium">Informed</span>
                    </div>
                    <p className="text-white">
                      {activity.informed.length > 0 ? activity.informed.join(', ') : 'None'}
                    </p>
                  </div>
                </div>
                
                {/* Due Date and Actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Due: {activity.due_date ? new Date(activity.due_date).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    {activity.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateActivityStatus(activity.id, 'IN_PROGRESS')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Start
                      </Button>
                    )}
                    
                    {activity.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateActivityStatus(activity.id, 'COMPLETED')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Complete
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedActivity(activity);
                        setIsEditActivityOpen(true);
                      }}
                      className="bg-glass border-gray-600 text-white hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* RACI Legend */}
      <Card className="bg-glass border-purple-500">
        <CardHeader>
          <CardTitle className="text-white">RACI Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-white font-medium">Responsible (R)</p>
                <p className="text-gray-400">Does the work</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-white font-medium">Accountable (A)</p>
                <p className="text-gray-400">Answerable for the work</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-white font-medium">Consulted (C)</p>
                <p className="text-gray-400">Provides input</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-white font-medium">Informed (I)</p>
                <p className="text-gray-400">Kept up to date</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
