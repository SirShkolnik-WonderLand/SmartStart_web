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
  FileText, 
  Users, 
  Plus, 
  Edit, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Download,
  Eye,
  Signature
} from 'lucide-react';

interface TeamRole {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  rbac_level: number;
  responsibilities: string[];
  permissions: string[];
  equity_range: {
    min: number;
    max: number;
  };
  time_commitment: string;
}

interface ProjectCharter {
  id: string;
  project_id: string;
  template_id: string;
  user_id: string;
  role: string;
  title: string;
  content: string;
  status: string;
  signed_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  project_id: string;
  user_id: string;
  role_id: string;
  equity_percentage: number;
  vesting_schedule: any;
  start_date: string;
  end_date: string;
  status: string;
  charter_signed: boolean;
  charter_signed_at: string;
  user_name: string;
  user_email: string;
  role_name: string;
  role_description: string;
  role_responsibilities: string[];
}

interface TeamCharterManagerProps {
  projectId: string;
}

export default function TeamCharterManager({ projectId }: TeamCharterManagerProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamRoles, setTeamRoles] = useState<TeamRole[]>([]);
  const [charters, setCharters] = useState<ProjectCharter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isCreateCharterOpen, setIsCreateCharterOpen] = useState(false);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [isSignCharterOpen, setIsSignCharterOpen] = useState(false);

  // Form states
  const [newRoleData, setNewRoleData] = useState({
    user_id: '',
    role_id: '',
    equity_percentage: 0,
    vesting_schedule: {
      cliff_months: 12,
      vesting_months: 48,
      vesting_type: 'LINEAR'
    }
  });

  const [charterData, setCharterData] = useState({
    user_id: '',
    role: '',
    custom_content: ''
  });

  const [signatureData, setSignatureData] = useState({
    user_id: '',
    signature_method: 'DIGITAL',
    consent_given: false,
    terms_accepted: false
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [teamRes, rolesRes, chartersRes] = await Promise.all([
        fetch(`/api/venture-legal/team/project/${projectId}`),
        fetch('/api/venture-legal/team-roles'),
        fetch(`/api/venture-legal/charters/project/${projectId}`)
      ]);

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamMembers(teamData.data.team_members);
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setTeamRoles(rolesData.data.roles);
      }

      if (chartersRes.ok) {
        const chartersData = await chartersRes.json();
        setCharters(chartersData.data.charters);
      }

    } catch (err) {
      setError('Failed to load team data');
      console.error('Error loading team data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    try {
      const response = await fetch('/api/venture-legal/team-roles/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          ...newRoleData
        })
      });

      if (response.ok) {
        await loadData();
        setIsAssignRoleOpen(false);
        setNewRoleData({
          user_id: '',
          role_id: '',
          equity_percentage: 0,
          vesting_schedule: {
            cliff_months: 12,
            vesting_months: 48,
            vesting_type: 'LINEAR'
          }
        });
      }
    } catch (err) {
      console.error('Error assigning role:', err);
    }
  };

  const handleCreateCharter = async () => {
    try {
      const response = await fetch('/api/venture-legal/charters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          ...charterData
        })
      });

      if (response.ok) {
        await loadData();
        setIsCreateCharterOpen(false);
        setCharterData({
          user_id: '',
          role: '',
          custom_content: ''
        });
      }
    } catch (err) {
      console.error('Error creating charter:', err);
    }
  };

  const handleSignCharter = async () => {
    try {
      if (!selectedMember) return;

      const charter = charters.find(c => c.user_id === selectedMember.user_id);
      if (!charter) return;

      const response = await fetch(`/api/venture-legal/charters/${charter.id}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedMember.user_id,
          signature_data: {
            ...signatureData,
            ip_address: '127.0.0.1', // In real app, get from request
            user_agent: navigator.userAgent
          }
        })
      });

      if (response.ok) {
        await loadData();
        setIsSignCharterOpen(false);
        setSelectedMember(null);
        setSignatureData({
          user_id: '',
          signature_method: 'DIGITAL',
          consent_given: false,
          terms_accepted: false
        });
      }
    } catch (err) {
      console.error('Error signing charter:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'signed':
      case 'completed':
        return 'bg-green-500';
      case 'draft':
      case 'pending':
        return 'bg-yellow-500';
      case 'expired':
      case 'revoked':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'signed':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'draft':
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'expired':
      case 'revoked':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
          <h2 className="text-2xl font-bold text-white">Team Charter Management</h2>
          <p className="text-gray-400 mt-1">Manage team roles, equity, and legal charters</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-glass border-purple-500 text-white hover:bg-purple-600">
                <Users className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-purple-500">
              <DialogHeader>
                <DialogTitle className="text-white">Assign Team Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user_id" className="text-white">User</Label>
                  <Select onValueChange={(value) => setNewRoleData({...newRoleData, user_id: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* In real app, populate with available users */}
                      <SelectItem value="user1">John Doe</SelectItem>
                      <SelectItem value="user2">Jane Smith</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="role_id" className="text-white">Role</Label>
                  <Select onValueChange={(value) => setNewRoleData({...newRoleData, role_id: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="equity_percentage" className="text-white">Equity Percentage</Label>
                  <Input
                    id="equity_percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newRoleData.equity_percentage}
                    onChange={(e) => setNewRoleData({...newRoleData, equity_percentage: parseFloat(e.target.value)})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <Button onClick={handleAssignRole} className="w-full bg-purple-600 hover:bg-purple-700">
                  Assign Role
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateCharterOpen} onOpenChange={setIsCreateCharterOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <FileText className="h-4 w-4 mr-2" />
                Create Charter
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-purple-500">
              <DialogHeader>
                <DialogTitle className="text-white">Create Project Charter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="charter_user_id" className="text-white">Team Member</Label>
                  <Select onValueChange={(value) => setCharterData({...charterData, user_id: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select team member" />
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
                  <Label htmlFor="charter_role" className="text-white">Role</Label>
                  <Select onValueChange={(value) => setCharterData({...charterData, role: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamRoles.map((role) => (
                        <SelectItem key={role.name} value={role.name}>
                          {role.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="custom_content" className="text-white">Custom Content (Optional)</Label>
                  <Textarea
                    id="custom_content"
                    value={charterData.custom_content}
                    onChange={(e) => setCharterData({...charterData, custom_content: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={4}
                    placeholder="Enter custom charter content..."
                  />
                </div>
                
                <Button onClick={handleCreateCharter} className="w-full bg-purple-600 hover:bg-purple-700">
                  Create Charter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Team Members Overview */}
      <Card className="bg-glass border-purple-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Team Members ({teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => {
              const memberCharter = charters.find(c => c.user_id === member.user_id);
              
              return (
                <div key={member.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{member.user_name}</h3>
                          <p className="text-gray-400">{member.role_name}</p>
                          <p className="text-sm text-purple-400">
                            Equity: {member.equity_percentage}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-400 mb-1">Responsibilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {member.role_responsibilities.slice(0, 3).map((responsibility, index) => (
                            <Badge key={index} variant="outline" className="text-xs text-gray-300 border-gray-600">
                              {responsibility}
                            </Badge>
                          ))}
                          {member.role_responsibilities.length > 3 && (
                            <Badge variant="outline" className="text-xs text-gray-300 border-gray-600">
                              +{member.role_responsibilities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Charter Status */}
                      <div className="text-center">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusIcon(memberCharter?.status || 'NOT_CREATED')}
                          <span className="text-sm text-gray-400">Charter</span>
                        </div>
                        <Badge className={`${getStatusColor(memberCharter?.status || 'NOT_CREATED')} text-white`}>
                          {memberCharter?.status || 'NOT_CREATED'}
                        </Badge>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex space-x-2">
                        {!memberCharter && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCharterData({...charterData, user_id: member.user_id, role: member.role_name});
                              setIsCreateCharterOpen(true);
                            }}
                            className="bg-glass border-purple-500 text-white hover:bg-purple-600"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {memberCharter && memberCharter.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedMember(member);
                              setSignatureData({...signatureData, user_id: member.user_id});
                              setIsSignCharterOpen(true);
                            }}
                            className="bg-glass border-green-500 text-white hover:bg-green-600"
                          >
                            <Signature className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {memberCharter && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-glass border-blue-500 text-white hover:bg-blue-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charters List */}
      <Card className="bg-glass border-purple-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Project Charters ({charters.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {charters.map((charter) => (
              <div key={charter.id} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{charter.title}</h3>
                    <p className="text-sm text-gray-400">
                      Role: {charter.role} | Created: {new Date(charter.created_at).toLocaleDateString()}
                    </p>
                    {charter.signed_at && (
                      <p className="text-sm text-green-400">
                        Signed: {new Date(charter.signed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(charter.status)} text-white`}>
                      {charter.status}
                    </Badge>
                    
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" className="bg-glass border-blue-500 text-white hover:bg-blue-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="bg-glass border-green-500 text-white hover:bg-green-600">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sign Charter Dialog */}
      <Dialog open={isSignCharterOpen} onOpenChange={setIsSignCharterOpen}>
        <DialogContent className="bg-gray-900 border-purple-500">
          <DialogHeader>
            <DialogTitle className="text-white">Sign Project Charter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMember && (
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="text-white font-medium">{selectedMember.user_name}</h3>
                <p className="text-gray-400">{selectedMember.role_name}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms_accepted"
                  checked={signatureData.terms_accepted}
                  onChange={(e) => setSignatureData({...signatureData, terms_accepted: e.target.checked})}
                  className="rounded border-gray-600 bg-gray-800 text-purple-600"
                />
                <Label htmlFor="terms_accepted" className="text-white">
                  I accept the terms and conditions of this charter
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="consent_given"
                  checked={signatureData.consent_given}
                  onChange={(e) => setSignatureData({...signatureData, consent_given: e.target.checked})}
                  className="rounded border-gray-600 bg-gray-800 text-purple-600"
                />
                <Label htmlFor="consent_given" className="text-white">
                  I consent to electronic signature and digital document processing
                </Label>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleSignCharter}
                disabled={!signatureData.terms_accepted || !signatureData.consent_given}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Signature className="h-4 w-4 mr-2" />
                Sign Charter
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsSignCharterOpen(false)}
                className="bg-glass border-gray-600 text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
