import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ChevronRight,
  Shield,
  TrendingUp,
  FileText,
  LogOut,
  User
} from "lucide-react";
import { Stats, Control, Project } from "../../../shared/iso";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface StatsDashboardProps {
  stats: Stats;
  controls: Control[];
  project: Project | null;
  userName: string;
  userId?: string | null;
  onNavigateToDomains?: () => void;
  onNavigateToControls?: () => void;
  onLogout?: () => void;
}

export default function StatsDashboard({ 
  stats, 
  controls, 
  project, 
  userName,
  userId,
  onNavigateToDomains,
  onNavigateToControls,
  onLogout
}: StatsDashboardProps) {
  
  // Prepare chart data
  const statusData = [
    { name: "Ready", value: stats.readyControls, color: "#22c55e" },
    { name: "Partial", value: stats.partialControls, color: "#f59e0b" },
    { name: "Missing", value: stats.missingControls, color: "#ef4444" }
  ];

  const domainData = controls.reduce((acc, control) => {
    if (!acc[control.domainId]) {
      acc[control.domainId] = { name: control.domainId, ready: 0, partial: 0, missing: 0 };
    }
    const status = project?.answers[control.id]?.status || "missing";
    acc[control.domainId][status]++;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(domainData);
  
  return (
    <div className="iso-container pt-24 pb-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  ISO 27001:2022 Compliance
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-lg text-muted-foreground">
                    Welcome back, <span className="font-semibold text-foreground">{userName}</span>!
                  </p>
                  {userId && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      <User className="w-3 h-3 inline mr-1" />
                      {userId.substring(0, 12)}...
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {onLogout && (
                <Button
                  onClick={onLogout}
                  variant="outline"
                  className="flex items-center gap-2 px-6 py-3 border-destructive/50 hover:border-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              )}
              {onNavigateToDomains && (
                <Button
                  onClick={onNavigateToDomains}
                  variant="outline"
                  className="flex items-center gap-2 px-6 py-3"
                >
                  <Shield className="w-4 h-4" />
                  View Domains
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
              {onNavigateToControls && (
                <Button
                  onClick={onNavigateToControls}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-6 py-3"
                >
                  <FileText className="w-4 h-4" />
                  View Controls
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className="iso-card hover:border-primary/50 hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all cursor-pointer"
              onClick={onNavigateToControls}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold iso-accent">
                    {stats.totalControls}
                  </div>
                </div>
                <h3 className="text-sm font-semibold iso-text-primary mb-1">
                  Total Controls
                </h3>
                <p className="text-xs iso-text-secondary">
                  93 Required
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ready Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className="iso-card hover:border-primary/50 hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all cursor-pointer"
              onClick={onNavigateToControls}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    {stats.readyControls}
                  </div>
                </div>
                <h3 className="text-sm font-semibold iso-text-primary mb-1">
                  Ready
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${stats.readinessPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-green-500">
                    {stats.readinessPercentage}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Partial Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card 
              className="iso-card hover:border-primary/50 hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all cursor-pointer"
              onClick={onNavigateToControls}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {stats.partialControls}
                  </div>
                </div>
                <h3 className="text-sm font-semibold iso-text-primary mb-1">
                  In Progress
                </h3>
                <p className="text-xs iso-text-secondary">
                  Needs attention
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Missing Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card 
              className="iso-card hover:border-primary/50 hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all cursor-pointer"
              onClick={onNavigateToControls}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold text-red-500">
                    {stats.missingControls}
                  </div>
                </div>
                <h3 className="text-sm font-semibold iso-text-primary mb-1">
                  Missing
                </h3>
                <p className="text-xs iso-text-secondary">
                  Action required
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="iso-card">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold iso-text-primary mb-4">
                  Status Distribution
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="iso-card">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold iso-text-primary mb-4">
                  Domain Progress
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Bar dataKey="ready" fill="#22c55e" name="Ready" />
                    <Bar dataKey="partial" fill="#f59e0b" name="Partial" />
                    <Bar dataKey="missing" fill="#ef4444" name="Missing" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6"
        >
          <Card className="iso-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold iso-text-primary mb-1">
                    Overall Progress
                  </h2>
                  <p className="text-sm iso-text-secondary">
                    {stats.progressPercentage}% complete
                  </p>
                </div>
                <div className="text-3xl font-bold iso-accent">
                  {stats.progressPercentage}%
                </div>
              </div>
              <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60"
                />
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs iso-text-secondary">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{stats.readyControls} Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>{stats.partialControls} In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span>{stats.missingControls} Missing</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="iso-card bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold iso-text-primary mb-2">
                    Ready to Continue?
                  </h3>
                  <p className="text-sm iso-text-secondary">
                    Start assessing controls or explore by domain
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={onNavigateToControls}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Start Assessment
                  </Button>
                  <Button
                    onClick={onNavigateToDomains}
                    variant="outline"
                  >
                    View Domains
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

