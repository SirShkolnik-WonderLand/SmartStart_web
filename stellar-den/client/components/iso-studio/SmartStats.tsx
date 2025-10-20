import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Target, 
  Activity,
  Zap
} from "lucide-react";
import { Stats, Control, Project, SmartStat } from "@shared/iso";

interface SmartStatsProps {
  stats: Stats;
  controls: Control[];
  project: Project | null;
}

export default function SmartStats({ stats, controls, project }: SmartStatsProps) {
  
  const calculateSmartStats = (): SmartStat[] => {
    const smartStats: SmartStat[] = [];

    // Overall Progress
    smartStats.push({
      id: "progress",
      title: "Overall Progress",
      value: `${stats.progressPercentage}%`,
      description: `${stats.readyControls} of ${stats.totalControls} controls complete`,
      icon: "TrendingUp",
      color: "text-blue-500",
      trend: stats.progressPercentage > 50 ? "up" : "down"
    });

    // Average Timeline
    const totalEffort = controls.reduce((sum, control) => {
      const answer = project?.answers[control.id];
      return sum + (answer?.effort || 0);
    }, 0);
    const avgEffort = controls.length > 0 ? Math.round(totalEffort / controls.length) : 0;
    const estimatedWeeks = Math.round(avgEffort * controls.length / 10);
    
    smartStats.push({
      id: "timeline",
      title: "Estimated Timeline",
      value: `${estimatedWeeks} weeks`,
      description: `Based on ${avgEffort}/5 average effort level`,
      icon: "Clock",
      color: "text-purple-500",
      trend: estimatedWeeks < 20 ? "good" : "warning"
    });

    // Risk Level
    const totalRisk = controls.reduce((sum, control) => {
      const answer = project?.answers[control.id];
      return sum + (answer?.riskImpact || 0);
    }, 0);
    const avgRisk = controls.length > 0 ? Math.round(totalRisk / controls.length) : 0;
    const riskLevel = avgRisk <= 2 ? "Low" : avgRisk <= 3 ? "Medium" : "High";
    
    smartStats.push({
      id: "risk",
      title: "Risk Level",
      value: riskLevel,
      description: `Average risk impact: ${avgRisk}/5`,
      icon: "AlertTriangle",
      color: avgRisk <= 2 ? "text-green-500" : avgRisk <= 3 ? "text-yellow-500" : "text-red-500",
      trend: avgRisk <= 2 ? "good" : "warning"
    });

    // Recent Activity
    const recentAnswers = Object.values(project?.answers || {}).filter(answer => {
      const updatedAt = new Date(answer.updatedAt);
      const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate <= 30;
    });
    
    smartStats.push({
      id: "activity",
      title: "Recent Activity",
      value: `${recentAnswers.length}`,
      description: "Controls updated in last 30 days",
      icon: "Activity",
      color: "text-cyan-500",
      trend: recentAnswers.length > 10 ? "up" : "down"
    });

    // Domain Coverage
    const domainsWithProgress = controls.reduce((acc, control) => {
      const answer = project?.answers[control.id];
      if (answer?.status === "ready") {
        acc[control.domainId] = (acc[control.domainId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    const coveredDomains = Object.keys(domainsWithProgress).length;
    
    smartStats.push({
      id: "coverage",
      title: "Domain Coverage",
      value: `${coveredDomains}/4`,
      description: "Domains with completed controls",
      icon: "Target",
      color: "text-indigo-500",
      trend: coveredDomains >= 3 ? "good" : "warning"
    });

    // Quick Wins
    const quickWins = controls.filter(control => {
      const answer = project?.answers[control.id];
      return answer?.status === "partial" && (answer?.effort || 0) <= 2;
    });
    
    smartStats.push({
      id: "quickwins",
      title: "Quick Wins Available",
      value: `${quickWins.length}`,
      description: "Low-effort partial controls to complete",
      icon: "Zap",
      color: "text-yellow-500",
      trend: quickWins.length > 0 ? "up" : "none"
    });

    return smartStats;
  };

  const smartStats = calculateSmartStats();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "TrendingUp": return <TrendingUp className="w-5 h-5" />;
      case "Clock": return <Clock className="w-5 h-5" />;
      case "AlertTriangle": return <AlertTriangle className="w-5 h-5" />;
      case "Activity": return <Activity className="w-5 h-5" />;
      case "Target": return <Target className="w-5 h-5" />;
      case "Zap": return <Zap className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold iso-text-primary mb-4">
        Smart Statistics
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {smartStats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="iso-card hover:border-primary/50 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                    {getIcon(stat.icon)}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold iso-accent">
                      {stat.value}
                    </div>
                    {stat.trend && (
                      <div className={`text-xs ${stat.trend === "up" || stat.trend === "good" ? "text-green-500" : "text-yellow-500"}`}>
                        {stat.trend === "up" || stat.trend === "good" ? "↑ Good" : "⚠️ Review"}
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-semibold iso-text-primary mb-1">
                  {stat.title}
                </h3>
                <p className="text-xs iso-text-secondary">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

