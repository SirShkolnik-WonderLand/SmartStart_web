'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Users, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Shield,
  Calendar,
  BarChart3
} from 'lucide-react';

interface LegalStatus {
  compliance_overview: {
    total_team_members: number;
    charters_signed: number;
    compliance_percentage: number;
    plan_active: boolean;
    raci_activities: number;
    smart_goals: number;
    completed_goals: number;
    high_risk_liabilities: number;
  };
  team_members: Array<{
    id: string;
    user_name: string;
    role_name: string;
    charter_status: string;
    charter_signed_at: string;
    equity_percentage: number;
  }>;
  legal_health_score: number;
}

interface ProjectPlan {
  plan: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    status: string;
  };
  phases: Array<{
    id: string;
    name: string;
    start_day: number;
    end_day: number;
    status: string;
    deliverables: any[];
  }>;
  milestones: Array<{
    id: string;
    name: string;
    target_day: number;
    status: string;
  }>;
}

interface RACIActivity {
  id: string;
  activity: string;
  description: string;
  responsible_name: string;
  accountable_name: string;
  priority: string;
  status: string;
  due_date: string;
}

interface SMARTGoal {
  id: string;
  title: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  time_bound: string;
  target_value: number;
  current_value: number;
  progress_percentage: number;
  status: string;
  due_date: string;
}

interface Liability {
  id: string;
  liability_type: string;
  description: string;
  potential_impact: string;
  probability: string;
  risk_score: number;
  mitigation_plan: string;
  status: string;
}

interface VentureLegalDashboardProps {
  projectId: string;
}

export default function VentureLegalDashboard({ projectId }: VentureLegalDashboardProps) {
  const [legalStatus, setLegalStatus] = useState<LegalStatus | null>(null);
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [raciActivities, setRACIActivities] = useState<RACIActivity[]>([]);
  const [smartGoals, setSMARTGoals] = useState<SMARTGoal[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [projectId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all dashboard data in parallel
      const [legalStatusRes, planRes, raciRes, goalsRes, liabilitiesRes] = await Promise.all([
        fetch(`/api/venture-legal/compliance/project/${projectId}`),
        fetch(`/api/venture-legal/plans/project/${projectId}`),
        fetch(`/api/venture-legal/raci-matrix/project/${projectId}`),
        fetch(`/api/venture-legal/smart-goals/project/${projectId}`),
        fetch(`/api/venture-legal/liabilities/project/${projectId}`)
      ]);

      if (legalStatusRes.ok) {
        const legalData = await legalStatusRes.json();
        setLegalStatus(legalData.data);
      }

      if (planRes.ok) {
        const planData = await planRes.json();
        setProjectPlan(planData.data);
      }

      if (raciRes.ok) {
        const raciData = await raciRes.json();
        setRACIActivities(raciData.data.activities);
      }

      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        setSMARTGoals(goalsData.data.goals);
      }

      if (liabilitiesRes.ok) {
        const liabilitiesData = await liabilitiesRes.json();
        setLiabilities(liabilitiesData.data.liabilities);
      }

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'signed':
      case 'achieved':
        return 'bg-green-500';
      case 'in_progress':
      case 'active':
        return 'bg-blue-500';
      case 'pending':
      case 'draft':
        return 'bg-yellow-500';
      case 'blocked':
      case 'expired':
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

  const getRiskScoreColor = (score: number) => {
    if (score >= 12) return 'text-red-600';
    if (score >= 9) return 'text-orange-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-green-600';
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
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p>{error}</p>
        <Button onClick={loadDashboardData} className="mt-2">
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
          <h1 className="text-3xl font-bold text-white">Venture Legal Dashboard</h1>
          <p className="text-gray-400 mt-1">Comprehensive legal management for your venture</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="bg-glass border-purple-500 text-white hover:bg-purple-600">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Shield className="h-4 w-4 mr-2" />
            Legal Actions
          </Button>
        </div>
      </div>

      {/* Legal Health Score */}
      {legalStatus && (
        <Card className="bg-glass border-purple-500">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Legal Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold text-white">
                {legalStatus.legal_health_score}/100
              </div>
              <div className="flex-1">
                <Progress 
                  value={legalStatus.legal_health_score} 
                  className="h-3"
                />
                <p className="text-sm text-gray-400 mt-2">
                  Overall legal compliance and risk management score
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {legalStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-glass border-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-400">Team Members</p>
                  <p className="text-2xl font-bold text-white">
                    {legalStatus.compliance_overview.total_team_members}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-glass border-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-400">Charters Signed</p>
                  <p className="text-2xl font-bold text-white">
                    {legalStatus.compliance_overview.charters_signed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-glass border-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-400">SMART Goals</p>
                  <p className="text-2xl font-bold text-white">
                    {legalStatus.compliance_overview.smart_goals}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-glass border-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-400">High Risk Items</p>
                  <p className="text-2xl font-bold text-white">
                    {legalStatus.compliance_overview.high_risk_liabilities}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-glass border-purple-500">
          <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
          <TabsTrigger value="team" className="text-white">Team & Charters</TabsTrigger>
          <TabsTrigger value="plan" className="text-white">30-Day Plan</TabsTrigger>
          <TabsTrigger value="raci" className="text-white">RACI Matrix</TabsTrigger>
          <TabsTrigger value="goals" className="text-white">SMART Goals</TabsTrigger>
          <TabsTrigger value="liabilities" className="text-white">Liabilities</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Compliance Status */}
            <Card className="bg-glass border-purple-500">
              <CardHeader>
                <CardTitle className="text-white">Team Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                {legalStatus?.team_members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                    <div>
                      <p className="text-white font-medium">{member.user_name}</p>
                      <p className="text-sm text-gray-400">{member.role_name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className={`${getStatusColor(member.charter_status)} text-white`}
                      >
                        {member.charter_status}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        {member.equity_percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Project Plan Status */}
            <Card className="bg-glass border-purple-500">
              <CardHeader>
                <CardTitle className="text-white">30-Day Plan Status</CardTitle>
              </CardHeader>
              <CardContent>
                {projectPlan ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{projectPlan.plan.title}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(projectPlan.plan.start_date).toLocaleDateString()} - 
                        {new Date(projectPlan.plan.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {projectPlan.phases.map((phase) => (
                        <div key={phase.id} className="flex items-center justify-between">
                          <span className="text-white">{phase.name}</span>
                          <Badge className={`${getStatusColor(phase.status)} text-white`}>
                            {phase.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No project plan found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team & Charters Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card className="bg-glass border-purple-500">
            <CardHeader>
              <CardTitle className="text-white">Team Members & Charters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {legalStatus?.team_members.map((member) => (
                  <div key={member.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{member.user_name}</h3>
                        <p className="text-gray-400">{member.role_name}</p>
                        <p className="text-sm text-purple-400">
                          Equity: {member.equity_percentage}%
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(member.charter_status)} text-white`}>
                          {member.charter_status}
                        </Badge>
                        {member.charter_signed_at && (
                          <span className="text-sm text-gray-400">
                            Signed: {new Date(member.charter_signed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 30-Day Plan Tab */}
        <TabsContent value="plan" className="space-y-4">
          <Card className="bg-glass border-purple-500">
            <CardHeader>
              <CardTitle className="text-white">30-Day Project Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {projectPlan ? (
                <div className="space-y-6">
                  {/* Plan Overview */}
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <h3 className="text-xl font-semibold text-white mb-2">{projectPlan.plan.title}</h3>
                    <p className="text-gray-400 mb-4">
                      {new Date(projectPlan.plan.start_date).toLocaleDateString()} - 
                      {new Date(projectPlan.plan.end_date).toLocaleDateString()}
                    </p>
                    <Badge className={`${getStatusColor(projectPlan.plan.status)} text-white`}>
                      {projectPlan.plan.status}
                    </Badge>
                  </div>

                  {/* Phases */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Phases</h4>
                    <div className="space-y-3">
                      {projectPlan.phases.map((phase) => (
                        <div key={phase.id} className="p-4 bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-white font-medium">{phase.name}</h5>
                            <Badge className={`${getStatusColor(phase.status)} text-white`}>
                              {phase.status}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">
                            Days {phase.start_day}-{phase.end_day}
                          </p>
                          {phase.deliverables && phase.deliverables.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Deliverables:</p>
                              <ul className="text-sm text-gray-300 ml-4">
                                {phase.deliverables.map((deliverable, index) => (
                                  <li key={index}>• {deliverable}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Milestones */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Milestones</h4>
                    <div className="space-y-2">
                      {projectPlan.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                          <div>
                            <span className="text-white">{milestone.name}</span>
                            <span className="text-sm text-gray-400 ml-2">
                              Day {milestone.target_day}
                            </span>
                          </div>
                          <Badge className={`${getStatusColor(milestone.status)} text-white`}>
                            {milestone.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No project plan found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RACI Matrix Tab */}
        <TabsContent value="raci" className="space-y-4">
          <Card className="bg-glass border-purple-500">
            <CardHeader>
              <CardTitle className="text-white">RACI Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {raciActivities.map((activity) => (
                  <div key={activity.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{activity.activity}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getPriorityColor(activity.priority)} text-white`}>
                          {activity.priority}
                        </Badge>
                        <Badge className={`${getStatusColor(activity.status)} text-white`}>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                    {activity.description && (
                      <p className="text-gray-400 text-sm mb-3">{activity.description}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Responsible</p>
                        <p className="text-white">{activity.responsible_name || 'Unassigned'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Accountable</p>
                        <p className="text-white">{activity.accountable_name || 'Unassigned'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Due Date</p>
                        <p className="text-white">
                          {activity.due_date ? new Date(activity.due_date).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMART Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card className="bg-glass border-purple-500">
            <CardHeader>
              <CardTitle className="text-white">SMART Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {smartGoals.map((goal) => (
                  <div key={goal.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">{goal.title}</h3>
                      <Badge className={`${getStatusColor(goal.status)} text-white`}>
                        {goal.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Specific: </span>
                        <span className="text-white">{goal.specific}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Measurable: </span>
                        <span className="text-white">{goal.measurable}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Achievable: </span>
                        <span className="text-white">{goal.achievable}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Relevant: </span>
                        <span className="text-white">{goal.relevant}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Time-bound: </span>
                        <span className="text-white">{goal.time_bound}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Progress</span>
                        <span className="text-sm text-white">
                          {goal.current_value}/{goal.target_value}
                        </span>
                      </div>
                      <Progress value={goal.progress_percentage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Liabilities Tab */}
        <TabsContent value="liabilities" className="space-y-4">
          <Card className="bg-glass border-purple-500">
            <CardHeader>
              <CardTitle className="text-white">Risk & Liabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liabilities.map((liability) => (
                  <div key={liability.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{liability.liability_type}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getPriorityColor(liability.potential_impact)} text-white`}>
                          {liability.potential_impact}
                        </Badge>
                        <span className={`text-sm font-semibold ${getRiskScoreColor(liability.risk_score)}`}>
                          Risk: {liability.risk_score}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">{liability.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Impact</p>
                        <p className="text-white">{liability.potential_impact}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Probability</p>
                        <p className="text-white">{liability.probability}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Status</p>
                        <p className="text-white">{liability.status}</p>
                      </div>
                    </div>

                    {liability.mitigation_plan && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-400 mb-1">Mitigation Plan:</p>
                        <p className="text-sm text-white">{liability.mitigation_plan}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
