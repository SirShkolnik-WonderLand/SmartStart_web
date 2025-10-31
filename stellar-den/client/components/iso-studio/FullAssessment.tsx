import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatsDashboard from "./StatsDashboard";
import AdvisorBot from "./AdvisorBot";
import DomainOverview from "./DomainOverview";
import ControlsTable from "./ControlsTable";
import ControlDetails from "./ControlDetails";
import SmartStats from "./SmartStats";
import { Control, Project, Stats, Framework, Answer } from "../../../shared/iso";
import { Card } from "@/components/ui/card";

type View = "dashboard" | "domains" | "controls" | "domain-controls";

interface FullAssessmentProps {
  onComplete: () => void;
}

export default function FullAssessment({ onComplete }: FullAssessmentProps) {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const [controls, setControls] = useState<Control[]>([]);
  const [framework, setFramework] = useState<Framework | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalControls: 0,
    readyControls: 0,
    partialControls: 0,
    missingControls: 0,
    progressPercentage: 0,
    readinessPercentage: 0
  });
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load controls
        const controlsRes = await fetch("/api/iso/controls");
        const controlsData = await controlsRes.json();
        setControls(controlsData.controls);

        // Create framework
        const domains = [
          { id: "A.5", code: "A.5", name: "Organizational Controls", description: "Governance and policies", controlCount: 0 },
          { id: "A.6", code: "A.6", name: "People Controls", description: "Roles and responsibilities", controlCount: 0 },
          { id: "A.7", code: "A.7", name: "Physical Controls", description: "Physical security", controlCount: 0 },
          { id: "A.8", code: "A.8", name: "Technological Controls", description: "Technical security", controlCount: 0 }
        ];

        setFramework({
          id: "iso27001",
          key: "ISO27001",
          name: "ISO/IEC 27001",
          version: "2022",
          description: "Information Security Management",
          controlCount: controlsData.controls.length,
          controls: controlsData.controls,
          domains
        });

        // Load or create project
        const savedProject = localStorage.getItem("iso_project");
        if (savedProject) {
          setProject(JSON.parse(savedProject));
        } else {
          const newProject: Project = {
            id: `project-${Date.now()}`,
            name: "My ISO 27001 Project",
            frameworkId: "iso27001",
            answers: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setProject(newProject);
          localStorage.setItem("iso_project", JSON.stringify(newProject));
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate stats
  useEffect(() => {
    if (project && controls.length > 0) {
      const ready = controls.filter(c => project.answers[c.id]?.status === "ready").length;
      const partial = controls.filter(c => project.answers[c.id]?.status === "partial").length;
      const missing = controls.length - ready - partial;
      
      setStats({
        totalControls: controls.length,
        readyControls: ready,
        partialControls: partial,
        missingControls: missing,
        progressPercentage: Math.round(((ready + partial) / controls.length) * 100),
        readinessPercentage: Math.round((ready / controls.length) * 100)
      });
    }
  }, [project, controls]);

  const handleSaveAnswer = (answer: Partial<Answer>) => {
    if (!project || !selectedControl) return;

    const updatedProject: Project = {
      ...project,
      answers: {
        ...project.answers,
        [selectedControl.id]: {
          ...answer,
          controlId: selectedControl.id,
          updatedAt: new Date().toISOString()
        } as Answer
      },
      updatedAt: new Date().toISOString()
    };

    setProject(updatedProject);
    localStorage.setItem("iso_project", JSON.stringify(updatedProject));
    setSelectedControl(null);
  };

  const handleSelectDomain = (domainId: string) => {
    setSelectedDomain(domainId);
    setCurrentView("domain-controls");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedDomain(null);
  };

  const handleBackToDomains = () => {
    setCurrentView("domains");
    setSelectedDomain(null);
  };

  const filteredControls = selectedDomain 
    ? controls.filter(c => c.domainId === selectedDomain)
    : controls;

  if (loading) {
    return (
      <div className="iso-container pt-24 flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="iso-text-secondary">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!framework) {
    return (
      <div className="iso-container pt-24 flex items-center justify-center min-h-screen p-8">
        <Card className="iso-card p-8 text-center">
          <p className="iso-text-primary">Failed to load framework data</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="iso-container min-h-screen pt-24">
      <AnimatePresence mode="wait">
        {currentView === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StatsDashboard
              stats={stats}
              controls={controls}
              project={project}
              userName="User"
              onNavigateToDomains={() => setCurrentView("domains")}
              onNavigateToControls={() => setCurrentView("controls")}
            />
            <AdvisorBot
              stats={stats}
              controls={controls}
              project={project}
              userName="User"
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-8">
              <SmartStats
                stats={stats}
                controls={controls}
                project={project}
              />
            </div>
          </motion.div>
        )}

        {currentView === "domains" && (
          <motion.div
            key="domains"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <DomainOverview
              framework={framework}
              controls={controls}
              project={project}
              onSelectDomain={handleSelectDomain}
              onBack={handleBackToDashboard}
            />
          </motion.div>
        )}

        {currentView === "controls" && (
          <motion.div
            key="controls"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ControlsTable
              controls={controls}
              project={project}
              selectedControl={selectedControl}
              onSelectControl={setSelectedControl}
              onBack={handleBackToDashboard}
            />
          </motion.div>
        )}

        {currentView === "domain-controls" && (
          <motion.div
            key="domain-controls"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ControlsTable
              controls={filteredControls}
              project={project}
              selectedControl={selectedControl}
              onSelectControl={setSelectedControl}
              onBack={handleBackToDomains}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Details Modal */}
      {selectedControl && (
        <ControlDetails
          control={selectedControl}
          answer={project?.answers[selectedControl.id]}
          onSave={handleSaveAnswer}
          onClose={() => setSelectedControl(null)}
        />
      )}
    </div>
  );
}
