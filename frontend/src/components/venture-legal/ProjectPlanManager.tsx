'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Plus, 
  Edit, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Target,
  BarChart3,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface ProjectPlan {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  phases: Array<{
    id: string;
    name: string;
    description: string;
    start_day: number;
    end_day: number;
    status: string;
    deliverables: string[];
    dependencies: string[];
  }>;
  milestones: Array<{
    id: string;
    name: string;
    description: string;
    target_day: number;
    status: string;
    achieved_at: string;
  }>;
}

interface ProjectPlanManagerProps {
  projectId: string;
}

export default function ProjectPlanManager({ projectId }: ProjectPlanManagerProps) {
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isEditPhaseOpen, setIsEditPhaseOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<any>(null);

  // Form states
  const [planData, setPlanData] = useState({
    title: '',
    description: '',
    phases: [
      {
        name: 'Foundation Phase',
        description: 'Project setup, team formation, and initial planning',
        start_day: 1,
        end_day: 7,
        deliverables: ['Team assembled', 'Project charter signed', 'Initial requirements defined'],
        dependencies: []
      },
      {
        name: 'Sprint 1 - Core Development',
        description: 'Core feature development and MVP creation',
        start_day: 8,
        end_day: 15,
        deliverables: ['Core features implemented', 'Basic MVP ready', 'Initial testing'],
        dependencies: ['Foundation Phase']
      },
      {
        name: 'Sprint 2 - Enhancement',
        description: 'Feature enhancement and testing',
        start_day: 16,
        end_day: 23,
        deliverables: ['Enhanced features', 'Comprehensive testing', 'Performance optimization'],
        dependencies: ['Sprint 1 - Core Development']
      },
      {
        name: 'Launch Preparation',
        description: 'Final testing, deployment, and launch',
        start_day: 24,
        end_day: 30,
        deliverables: ['Final testing', 'Deployment ready', 'Launch executed'],
        dependencies: ['Sprint 2 - Enhancement']
      }
    ],
    milestones: [
      {
        name: 'Team Formation Complete',
        description: 'All key team members onboarded and charters signed',
        target_day: 3
      },
      {
        name: 'MVP Ready',
        description: 'Minimum viable product completed and tested',
        target_day: 15
      },
      {
        name: 'Launch Ready',
        description: 'Product ready for public launch',
        target_day: 28
      }
    ]
  });

  useEffect(() => {
    loadProjectPlan();
  }, [projectId]);

  const loadProjectPlan = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/venture-legal/plans/project/${projectId}`);
      
      if (response.ok) {
        const data = await response.json();
        setProjectPlan(data.data);
      } else if (response.status === 404) {
        setProjectPlan(null);
      } else {
        setError('Failed to load project plan');
      }

    } catch (err) {
      setError('Failed to load project plan');
      console.error('Error loading project plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      const response = await fetch('/api/venture-legal/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          user_id: 'current_user', // In real app, get from auth context
          ...planData
        })
      });

      if (response.ok) {
        await loadProjectPlan();
        setIsCreatePlanOpen(false);
        setPlanData({
          title: '',
          description: '',
          phases: [],
          milestones: []
        });
      }
    } catch (err) {
      console.error('Error creating project plan:', err);
    }
  };

  const handleUpdatePhaseStatus = async (phaseId: string, status: string) => {
    try {
      const response = await fetch(`/api/venture-legal/plans/${projectPlan?.id}/phases`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phase_id: phaseId,
          status: status
        })
      });

      if (response.ok) {
        await loadProjectPlan();
      }
    } catch (err) {
      console.error('Error updating phase status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'achieved':
        return 'bg-green-500';
      case 'in_progress':
      case 'active':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'blocked':
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'achieved':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Square className="h-4 w-4" />;
    }
  };

  const calculateProgress = () => {
    if (!projectPlan) return 0;
    
    const totalPhases = projectPlan.phases.length;
    const completedPhases = projectPlan.phases.filter(phase => phase.status === 'COMPLETED').length;
    
    return totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;
  };

  const getCurrentPhase = () => {
    if (!projectPlan) return null;
    
    const today = new Date();
    const startDate = new Date(projectPlan.start_date);
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return projectPlan.phases.find(phase => 
      daysSinceStart >= phase.start_day && daysSinceStart <= phase.end_day
    );
  };

  const getUpcomingMilestones = () => {
    if (!projectPlan) return [];
    
    const today = new Date();
    const startDate = new Date(projectPlan.start_date);
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return projectPlan.milestones.filter(milestone => 
      milestone.target_day > daysSinceStart && milestone.status !== 'ACHIEVED'
    ).sort((a, b) => a.target_day - b.target_day);
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
        <Button onClick={loadProjectPlan} className="mt-2">
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
          <h2 className="text-2xl font-bold text-white">30-Day Project Plan</h2>
          <p className="text-gray-400 mt-1">Manage your venture's 30-day launch timeline</p>
        </div>
        {!projectPlan && (
          <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-purple-500 max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create 30-Day Project Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white">Plan Title</Label>
                  <Input
                    id="title"
                    value={planData.title}
                    onChange={(e) => setPlanData({...planData, title: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Enter plan title..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    value={planData.description}
                    onChange={(e) => setPlanData({...planData, description: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={3}
                    placeholder="Enter plan description..."
                  />
                </div>
                
                <div>
                  <Label className="text-white">Phases</Label>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {planData.phases.map((phase, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{phase.name}</h4>
                          <span className="text-sm text-gray-400">
                            Days {phase.start_day}-{phase.end_day}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{phase.description}</p>
                        <div className="text-sm text-gray-300">
                          <p className="font-medium">Deliverables:</p>
                          <ul className="ml-4">
                            {phase.deliverables.map((deliverable, i) => (
                              <li key={i}>• {deliverable}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-white">Milestones</Label>
                  <div className="space-y-2">
                    {planData.milestones.map((milestone, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{milestone.name}</h4>
                            <p className="text-sm text-gray-400">{milestone.description}</p>
                          </div>
                          <span className="text-sm text-purple-400">Day {milestone.target_day}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button onClick={handleCreatePlan} className="w-full bg-purple-600 hover:bg-purple-700">
                  Create 30-Day Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!projectPlan ? (
        <Card className="bg-glass border-purple-500">
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Project Plan Found</h3>
            <p className="text-gray-400 mb-4">
              Create a 30-day project plan to manage your venture's launch timeline
            </p>
            <Button 
              onClick={() => setIsCreatePlanOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Plan Overview */}
          <Card className="bg-glass border-purple-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>{projectPlan.title}</span>
                <Badge className={`${getStatusColor(projectPlan.status)} text-white`}>
                  {projectPlan.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-400">{projectPlan.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Start Date</p>
                    <p className="text-white font-medium">
                      {new Date(projectPlan.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">End Date</p>
                    <p className="text-white font-medium">
                      {new Date(projectPlan.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Progress</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={calculateProgress()} className="flex-1" />
                      <span className="text-white font-medium">{Math.round(calculateProgress())}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Phase */}
          {getCurrentPhase() && (
            <Card className="bg-glass border-blue-500">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Play className="h-5 w-5 mr-2 text-blue-500" />
                  Current Phase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-900/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {getCurrentPhase()?.name}
                  </h3>
                  <p className="text-gray-400 mb-3">{getCurrentPhase()?.description}</p>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-blue-400">
                      Days {getCurrentPhase()?.start_day}-{getCurrentPhase()?.end_day}
                    </span>
                    <Badge className={`${getStatusColor(getCurrentPhase()?.status || '')} text-white`}>
                      {getCurrentPhase()?.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phases */}
          <Card className="bg-glass border-purple-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Project Phases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectPlan.phases.map((phase) => (
                  <div key={phase.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(phase.status)}
                        <div>
                          <h3 className="text-white font-medium">{phase.name}</h3>
                          <p className="text-sm text-gray-400">
                            Days {phase.start_day}-{phase.end_day}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(phase.status)} text-white`}>
                          {phase.status}
                        </Badge>
                        
                        {phase.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdatePhaseStatus(phase.id, 'IN_PROGRESS')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Start
                          </Button>
                        )}
                        
                        {phase.status === 'IN_PROGRESS' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdatePhaseStatus(phase.id, 'COMPLETED')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-400 mb-3">{phase.description}</p>
                    
                    {phase.deliverables && phase.deliverables.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Deliverables:</p>
                        <ul className="text-sm text-gray-300 ml-4 space-y-1">
                          {phase.deliverables.map((deliverable, index) => (
                            <li key={index} className="flex items-center">
                              <span className="mr-2">•</span>
                              <span>{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card className="bg-glass border-purple-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Project Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectPlan.milestones.map((milestone) => (
                  <div key={milestone.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(milestone.status)}
                        <div>
                          <h3 className="text-white font-medium">{milestone.name}</h3>
                          <p className="text-sm text-gray-400">{milestone.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-purple-400">Day {milestone.target_day}</span>
                        <Badge className={`${getStatusColor(milestone.status)} text-white`}>
                          {milestone.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Milestones */}
          {getUpcomingMilestones().length > 0 && (
            <Card className="bg-glass border-yellow-500">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                  Upcoming Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getUpcomingMilestones().map((milestone) => (
                    <div key={milestone.id} className="p-3 bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">{milestone.name}</h4>
                          <p className="text-sm text-gray-400">{milestone.description}</p>
                        </div>
                        <span className="text-sm text-yellow-400">Day {milestone.target_day}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
