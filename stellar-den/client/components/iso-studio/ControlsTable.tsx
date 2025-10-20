import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ChevronRight,
  Search,
  List,
  Grid3x3,
  FileText,
  ArrowLeft,
  Filter
} from "lucide-react";
import { Control, Project } from "@shared/iso";

type ViewMode = "story" | "list" | "grid";

interface ControlsTableProps {
  controls: Control[];
  project: Project | null;
  selectedControl: Control | null;
  onSelectControl: (control: Control) => void;
  onBack?: () => void;
}

export default function ControlsTable({ 
  controls, 
  project, 
  selectedControl, 
  onSelectControl,
  onBack 
}: ControlsTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ready" | "partial" | "missing">("all");

  const getStatus = (controlId: string) => {
    const answer = project?.answers[controlId];
    return answer?.status || "missing";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "partial": return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "border-green-500/50 bg-green-500/5";
      case "partial": return "border-yellow-500/50 bg-yellow-500/5";
      default: return "border-red-500/50 bg-red-500/5";
    }
  };

  const filteredControls = controls.filter(control => {
    const matchesSearch = control.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         control.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         control.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const status = getStatus(control.id);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="iso-container pt-24 pb-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold iso-text-primary">
                  Controls Assessment
                </h1>
                <p className="text-sm iso-text-secondary">
                  {filteredControls.length} of {controls.length} controls
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search controls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 iso-card border-primary/50"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                All
              </Button>
              <Button
                variant={statusFilter === "ready" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("ready")}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Ready
              </Button>
              <Button
                variant={statusFilter === "partial" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("partial")}
                className="flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Partial
              </Button>
              <Button
                variant={statusFilter === "missing" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("missing")}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Missing
              </Button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs iso-text-secondary">View:</span>
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 px-3"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 px-3"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "story" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("story")}
                className="h-8 px-3"
              >
                <FileText className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Controls Display */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredControls.map((control, index) => {
              const status = getStatus(control.id);
              const answer = project?.answers[control.id];
              
              return (
                <motion.div
                  key={control.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`iso-card hover:border-primary/50 hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all cursor-pointer h-full ${getStatusColor(status)} ${selectedControl?.id === control.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => onSelectControl(control)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-sm font-bold iso-accent">
                          {control.code}
                        </div>
                        {getStatusIcon(status)}
                      </div>
                      
                      <h3 className="text-sm font-bold iso-text-primary mb-2">
                        {control.title}
                      </h3>
                      
                      <p className="text-xs iso-text-secondary mb-3 line-clamp-2">
                        {control.description}
                      </p>

                      {control.tags && control.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {control.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {answer && (
                        <div className="flex items-center gap-3 text-xs iso-text-secondary pt-3 border-t border-border">
                          {answer.owner && (
                            <span>👤 {answer.owner}</span>
                          )}
                          {answer.dueDate && (
                            <span>📅 {new Date(answer.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-end mt-3">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {viewMode === "list" && (
          <Card className="iso-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-xs font-semibold iso-text-secondary">Status</th>
                      <th className="text-left p-4 text-xs font-semibold iso-text-secondary">Code</th>
                      <th className="text-left p-4 text-xs font-semibold iso-text-secondary">Control</th>
                      <th className="text-left p-4 text-xs font-semibold iso-text-secondary">Owner</th>
                      <th className="text-left p-4 text-xs font-semibold iso-text-secondary">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredControls.map((control, index) => {
                      const status = getStatus(control.id);
                      const answer = project?.answers[control.id];
                      
                      return (
                        <motion.tr
                          key={control.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={`border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${selectedControl?.id === control.id ? 'bg-primary/5' : ''}`}
                          onClick={() => onSelectControl(control)}
                        >
                          <td className="p-4">
                            {getStatusIcon(status)}
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold iso-accent">
                              {control.code}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-sm font-semibold iso-text-primary">
                              {control.title}
                            </div>
                            <div className="text-xs iso-text-secondary mt-1">
                              {control.description.substring(0, 80)}...
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-xs iso-text-secondary">
                              {answer?.owner || "—"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs iso-text-secondary">
                              {answer?.dueDate ? new Date(answer.dueDate).toLocaleDateString() : "—"}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === "story" && (
          <div className="space-y-4">
            {filteredControls.map((control, index) => {
              const status = getStatus(control.id);
              const answer = project?.answers[control.id];
              
              return (
                <motion.div
                  key={control.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`iso-card hover:border-primary/50 hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all cursor-pointer ${getStatusColor(status)} ${selectedControl?.id === control.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => onSelectControl(control)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold iso-accent">
                              {control.code}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {control.priority}
                            </span>
                          </div>
                          
                          <h3 className="text-base font-bold iso-text-primary mb-2">
                            {control.title}
                          </h3>
                          
                          <p className="text-sm iso-text-secondary mb-3 leading-relaxed">
                            {control.description}
                          </p>

                          {control.guidance && (
                            <div className="iso-card p-3 mb-3">
                              <p className="text-xs iso-text-secondary italic">
                                💡 {control.guidance}
                              </p>
                            </div>
                          )}

                          {control.tags && control.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {control.tags.map(tag => (
                                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {answer && (
                            <div className="flex items-center gap-4 text-xs iso-text-secondary pt-3 border-t border-border">
                              {answer.owner && (
                                <span>👤 {answer.owner}</span>
                              )}
                              {answer.dueDate && (
                                <span>📅 {new Date(answer.dueDate).toLocaleDateString()}</span>
                              )}
                              {answer.riskImpact && (
                                <span>⚠️ Risk: {answer.riskImpact}/5</span>
                              )}
                              {answer.effort && (
                                <span>⚡ Effort: {answer.effort}/5</span>
                              )}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredControls.length === 0 && (
          <Card className="iso-card">
            <CardContent className="p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold iso-text-primary mb-2">
                No Controls Found
              </h3>
              <p className="text-sm iso-text-secondary">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

