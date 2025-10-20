import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  X, 
  Save, 
  Calendar, 
  User, 
  AlertTriangle, 
  TrendingUp, 
  FileText,
  Shield,
  Clock
} from "lucide-react";
import { Control, Answer, ControlStatus } from "@shared/iso";

interface ControlDetailsProps {
  control: Control;
  answer: Answer | undefined;
  onSave: (answer: Partial<Answer>) => void;
  onClose: () => void;
}

export default function ControlDetails({ control, answer, onSave, onClose }: ControlDetailsProps) {
  const [formData, setFormData] = useState({
    status: "missing" as ControlStatus,
    owner: "",
    dueDate: "",
    riskImpact: 2,
    effort: 2,
    notes: ""
  });

  useEffect(() => {
    if (answer) {
      setFormData({
        status: answer.status,
        owner: answer.owner || "",
        dueDate: answer.dueDate || "",
        riskImpact: answer.riskImpact || 2,
        effort: answer.effort || 2,
        notes: answer.notes || ""
      });
    } else {
      setFormData({
        status: "missing",
        owner: "",
        dueDate: "",
        riskImpact: 2,
        effort: 2,
        notes: ""
      });
    }
  }, [answer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="iso-card shadow-2xl">
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold iso-accent mb-1">
                      {control.code}
                    </div>
                    <h2 className="text-lg font-bold iso-text-primary">
                      {control.title}
                    </h2>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="p-6 space-y-6">
                  {/* Control Info Section */}
                  <div className="iso-card p-4">
                    <h3 className="text-sm font-bold iso-text-primary mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Description
                    </h3>
                    <p className="text-sm iso-text-secondary leading-relaxed mb-4">
                      {control.description}
                    </p>
                    
                    {control.guidance && (
                      <>
                        <h3 className="text-sm font-bold iso-text-primary mb-2">
                          Implementation Guidance
                        </h3>
                        <p className="text-sm iso-text-secondary leading-relaxed">
                          {control.guidance}
                        </p>
                      </>
                    )}

                    {control.tags && control.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {control.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assessment Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-sm font-bold iso-text-primary flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Assessment
                    </h3>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold iso-text-primary">
                        Status
                      </Label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ControlStatus })}
                        className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background iso-text-primary text-sm focus:border-primary focus:outline-none transition-colors"
                      >
                        <option value="missing">Missing - Not Started</option>
                        <option value="partial">Partial - In Progress</option>
                        <option value="ready">Ready - Complete</option>
                      </select>
                    </div>

                    {/* Owner and Due Date Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold iso-text-primary flex items-center gap-2">
                          <User className="w-3 h-3" />
                          Owner
                        </Label>
                        <Input
                          type="text"
                          placeholder="Assign owner..."
                          value={formData.owner}
                          onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                          className="iso-card border-primary/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold iso-text-primary flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          Due Date
                        </Label>
                        <Input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="iso-card border-primary/50"
                        />
                      </div>
                    </div>

                    {/* Risk Impact and Effort Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold iso-text-primary flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" />
                          Risk Impact (1-5)
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="range"
                            min="1"
                            max="5"
                            value={formData.riskImpact}
                            onChange={(e) => setFormData({ ...formData, riskImpact: parseInt(e.target.value) })}
                            className="flex-1"
                          />
                          <span className="text-sm font-bold iso-accent min-w-[2rem] text-center">
                            {formData.riskImpact}
                          </span>
                        </div>
                        <p className="text-xs iso-text-secondary">
                          How critical is this control?
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold iso-text-primary flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Effort Level (1-5)
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="range"
                            min="1"
                            max="5"
                            value={formData.effort}
                            onChange={(e) => setFormData({ ...formData, effort: parseInt(e.target.value) })}
                            className="flex-1"
                          />
                          <span className="text-sm font-bold iso-accent min-w-[2rem] text-center">
                            {formData.effort}
                          </span>
                        </div>
                        <p className="text-xs iso-text-secondary">
                          How much effort to implement?
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold iso-text-primary">
                        Notes & References
                      </Label>
                      <Textarea
                        placeholder="Add implementation notes, references, evidence..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                        className="iso-card border-primary/50 resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        type="submit"
                        className="flex-1 bg-primary hover:bg-primary/90 shadow-glow-teal dark:shadow-glow-cyan"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Assessment
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

