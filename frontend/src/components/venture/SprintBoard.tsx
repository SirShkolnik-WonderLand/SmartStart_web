'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Clock, User, AlertCircle, CheckCircle, Play } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  taskType: string;
  priority: number;
  storyPoints: number;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
}

interface Sprint {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  capacityHours: number;
  totalStoryPoints: number;
  completedPoints: number;
  velocity: number;
  tasks: Task[];
}

interface SprintBoardProps {
  ventureId: string;
  sprintId?: string;
}

const SprintBoard: React.FC<SprintBoardProps> = ({ ventureId, sprintId }) => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    taskType: 'FEATURE',
    priority: 3,
    storyPoints: 1,
    estimatedHours: 0
  });

  useEffect(() => {
    fetchSprints();
  }, [ventureId, fetchSprints]);

  useEffect(() => {
    if (sprintId && sprints.length > 0) {
      const sprint = sprints.find(s => s.id === sprintId);
      setCurrentSprint(sprint || null);
    } else if (sprints.length > 0) {
      setCurrentSprint(sprints[0]);
    }
  }, [sprintId, sprints]);

  const fetchSprints = useCallback(async () => {
    try {
      const response = await fetch(`/api/venture-management/${ventureId}/sprints`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sprints');
      }

      const data = await response.json();
      setSprints(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [ventureId]);

  const createSprint = async () => {
    try {
      const response = await fetch(`/api/venture-management/${ventureId}/sprints`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `Sprint ${sprints.length + 1}`,
          description: 'New sprint',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          capacityHours: 40
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create sprint');
      }

      await fetchSprints();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const createTask = async () => {
    if (!currentSprint) return;

    try {
      const response = await fetch(`/api/venture-management/${ventureId}/sprints/${currentSprint.id}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      setNewTask({
        title: '',
        description: '',
        taskType: 'FEATURE',
        priority: 3,
        storyPoints: 1,
        estimatedHours: 0
      });
      setShowCreateTask(false);
      await fetchSprints();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    if (!currentSprint) return;

    try {
      const response = await fetch(`/api/venture-management/${ventureId}/sprints/${currentSprint.id}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      await fetchSprints();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'TODO': return 'bg-gray-500';
  //     case 'IN_PROGRESS': return 'bg-blue-500';
  //     case 'REVIEW': return 'bg-yellow-500';
  //     case 'DONE': return 'bg-green-500';
  //     case 'BLOCKED': return 'bg-red-500';
  //     default: return 'bg-gray-500';
  //   }
  // };

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'TODO': return <Square className="w-4 h-4" />;
  //     case 'IN_PROGRESS': return <Play className="w-4 h-4" />;
  //     case 'REVIEW': return <Clock className="w-4 h-4" />;
  //     case 'DONE': return <CheckCircle className="w-4 h-4" />;
  //     case 'BLOCKED': return <AlertCircle className="w-4 h-4" />;
  //     default: return <Square className="w-4 h-4" />;
  //   }
  // };

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'text-red-500';
    if (priority >= 4) return 'text-orange-500';
    if (priority >= 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case 'FEATURE': return 'bg-blue-500';
      case 'BUG': return 'bg-red-500';
      case 'IMPROVEMENT': return 'bg-green-500';
      case 'RESEARCH': return 'bg-purple-500';
      case 'DOCUMENTATION': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTasksByStatus = (status: string) => {
    if (!currentSprint) return [];
    return currentSprint.tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-8 bg-white/10 rounded"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-20 bg-white/10 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Sprint Board</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchSprints}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (sprints.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
        <div className="text-center">
          <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Sprints Found</h3>
          <p className="text-gray-400 mb-4">Create your first sprint to start managing tasks</p>
          <button
            onClick={createSprint}
            className="px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg hover:from-green-500 hover:to-blue-600 transition-all duration-200 font-semibold"
          >
            Create Sprint
          </button>
        </div>
      </div>
    );
  }

  const statusColumns = [
    { key: 'TODO', title: 'To Do', color: 'bg-gray-500' },
    { key: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-500' },
    { key: 'REVIEW', title: 'Review', color: 'bg-yellow-500' },
    { key: 'DONE', title: 'Done', color: 'bg-green-500' }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
      {/* Sprint Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Sprint Board</h2>
          {currentSprint && (
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Sprint: <span className="text-white font-semibold">{currentSprint.name}</span></span>
              <span>Velocity: <span className="text-white font-semibold">{currentSprint.velocity}</span></span>
              <span>Points: <span className="text-white font-semibold">{currentSprint.completedPoints}/{currentSprint.totalStoryPoints}</span></span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateTask(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Sprint Progress */}
      {currentSprint && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Sprint Progress</span>
            <span>{currentSprint.completedPoints}/{currentSprint.totalStoryPoints} points</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentSprint.completedPoints / currentSprint.totalStoryPoints) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Sprint Board */}
      <div className="grid grid-cols-4 gap-4">
        {statusColumns.map((column) => (
          <div key={column.key} className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">{column.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${column.color}`}>
                {getTasksByStatus(column.key).length}
              </span>
            </div>
            <div className="space-y-3">
              {getTasksByStatus(column.key).map((task) => (
                <div
                  key={task.id}
                  className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium text-sm">{task.title}</h4>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                        P{task.priority}
                      </span>
                      <span className="text-xs text-gray-400">{task.storyPoints}pt</span>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-400 text-xs mb-2 line-clamp-2">{task.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTaskTypeColor(task.taskType)}`}>
                        {task.taskType}
                      </span>
                      {task.assignee && (
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{task.assignee.name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-1">
                      {task.status === 'TODO' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="Start Task"
                        >
                          <Play className="w-3 h-3 text-blue-500" />
                        </button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'REVIEW')}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="Move to Review"
                        >
                          <Clock className="w-3 h-3 text-yellow-500" />
                        </button>
                      )}
                      {task.status === 'REVIEW' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'DONE')}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="Complete Task"
                        >
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Task description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={newTask.taskType}
                    onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FEATURE">Feature</option>
                    <option value="BUG">Bug</option>
                    <option value="IMPROVEMENT">Improvement</option>
                    <option value="RESEARCH">Research</option>
                    <option value="DOCUMENTATION">Documentation</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 - Low</option>
                    <option value={2}>2 - Medium-Low</option>
                    <option value={3}>3 - Medium</option>
                    <option value={4}>4 - High</option>
                    <option value={5}>5 - Critical</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Story Points</label>
                  <input
                    type="number"
                    value={newTask.storyPoints}
                    onChange={(e) => setNewTask({ ...newTask, storyPoints: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Est. Hours</label>
                  <input
                    type="number"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateTask(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintBoard;
