import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Grid3x3, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Framework, Control, Project, Domain } from "../../../shared/iso";

interface DomainOverviewProps {
  framework: Framework;
  controls: Control[];
  project: Project | null;
  onSelectDomain: (domainId: string) => void;
  onBack?: () => void;
}

export default function DomainOverview({ 
  framework, 
  controls, 
  project, 
  onSelectDomain,
  onBack 
}: DomainOverviewProps) {
  
  const getDomainStats = (domainId: string) => {
    const domainControls = controls.filter(c => c.domainId === domainId);
    const ready = domainControls.filter(c => project?.answers[c.id]?.status === 'ready').length;
    const partial = domainControls.filter(c => project?.answers[c.id]?.status === 'partial').length;
    const missing = domainControls.filter(c => !project?.answers[c.id] || project?.answers[c.id]?.status === 'missing').length;
    const progress = domainControls.length > 0 ? Math.round((ready / domainControls.length) * 100) : 0;
    
    return { total: domainControls.length, ready, partial, missing, progress };
  };

  const totalReady = controls.filter(c => project?.answers[c.id]?.status === 'ready').length;
  const totalProgress = controls.length > 0 ? Math.round((totalReady / controls.length) * 100) : 0;

  return (
    <div className="iso-container pt-24 pb-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Grid3x3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold iso-text-primary">
                  Control Domains
                </h1>
                <p className="text-sm iso-text-secondary">
                  {framework?.domains?.length || 0} domains, {controls.length} controls
                </p>
              </div>
            </div>
            {onBack && (
              <Button
                onClick={onBack}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Overview
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="iso-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Grid3x3 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold iso-accent">
                    {framework?.domains?.length || 0}
                  </div>
                </div>
                <h3 className="text-sm font-semibold iso-text-primary mb-1">
                  Domains
                </h3>
                <p className="text-xs iso-text-secondary">
                  4 Key Areas
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="iso-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-500">
                    {controls.length}
                  </div>
                </div>
                <h3 className="text-sm font-semibold iso-text-primary mb-1">
                  Total Controls
                </h3>
                <p className="text-xs iso-text-secondary">
                  ISO 27001:2022
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="iso-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    {totalReady}
                  </div>
                </div>
                <h3 className="text-sm font-semibold iso-text-primary mb-1">
                  Ready
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${totalProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-green-500">
                    {totalProgress}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="iso-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold text-red-500">
                    {controls.filter(c => !project?.answers[c.id] || project?.answers[c.id]?.status === 'missing').length}
                  </div>
                </div>
                <h3 className="text-sm font-semibold iso-text-primary mb-1">
                  Needs Attention
                </h3>
                <p className="text-xs iso-text-secondary">
                  Action Required
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Domain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {framework?.domains?.map((domain, index) => {
            const stats = getDomainStats(domain.id);
            
            return (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card 
                  className="iso-card hover:border-primary/50 hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all cursor-pointer h-full"
                  onClick={() => onSelectDomain(domain.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-lg font-bold iso-accent">
                            {domain.code}
                          </div>
                          <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {stats.total} controls
                          </div>
                        </div>
                        <h3 className="text-lg font-bold iso-text-primary mb-2">
                          {domain.name}
                        </h3>
                        <p className="text-xs iso-text-secondary mb-4">
                          {domain.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs iso-text-secondary">Progress</span>
                        <span className="text-xs font-semibold iso-accent">
                          {stats.progress}%
                        </span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60"
                        />
                      </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="iso-text-secondary">{stats.ready} Ready</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="iso-text-secondary">{stats.partial} Partial</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="iso-text-secondary">{stats.missing} Missing</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

