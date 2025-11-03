import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatsDashboard from "./StatsDashboard";
import AdvisorBot from "./AdvisorBot";
import DomainOverview from "./DomainOverview";
import ControlsTable from "./ControlsTable";
import ControlDetails from "./ControlDetails";
import SmartStats from "./SmartStats";
import AuthGate from "./AuthGate";
import { Control, Project, Stats, Framework, Answer } from "../../../shared/iso";
import { Card } from "@/components/ui/card";

type View = "dashboard" | "domains" | "controls" | "domain-controls";

interface FullAssessmentProps {
  onComplete: () => void;
}

export default function FullAssessment({ onComplete }: FullAssessmentProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [authSession, setAuthSession] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
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

  // Handle authentication
  const handleAuthenticated = (session: any, authUserId: string) => {
    setAuthSession(session);
    setUserId(authUserId);
    setAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("iso_auth_session");
    setAuthenticated(false);
    setAuthSession(null);
    setUserId(null);
    setProject(null);
    setControls([]);
    setFramework(null);
    setLoading(true);
  };

  // Load data
  useEffect(() => {
    if (!authenticated) return;

    const loadData = async () => {
      try {
        // Load user's saved assessment data
        if (userId && authSession) {
          const savedRes = await fetch("/api/auth/load-assessment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, session: authSession }),
          });
          
          if (savedRes.ok) {
            const savedData = await savedRes.json();
            if (savedData.data) {
              // User has saved data, use it
              const savedProject: Project = {
                id: savedData.data.id || `project-${Date.now()}`,
                name: savedData.data.name || "My ISO 27001 Project",
                frameworkId: savedData.data.frameworkId || "iso27001",
                answers: savedData.data.answers || {},
                createdAt: savedData.data.createdAt || new Date().toISOString(),
                updatedAt: savedData.data.updatedAt || new Date().toISOString(),
              };
              setProject(savedProject);
              console.log("✅ Loaded saved assessment data for user:", userId);
            } else {
              console.log("ℹ️ No saved data found for user:", userId);
            }
          }
        }

        // Load controls
        const controlsRes = await fetch("/api/iso/controls");
        const controlsData = await controlsRes.json();
        setControls(controlsData.controls);

        // Create framework domains based on actual control domainIds
        const domainIds = [...new Set(controlsData.controls.map((c: any) => c.domainId))];
        const domainNames: Record<string, { name: string; description: string }> = {
          "A.5": { name: "Organizational Controls", description: "Governance and policies" },
          "A.6": { name: "People Controls", description: "Roles and responsibilities" },
          "A.7": { name: "Physical Controls", description: "Physical security" },
          "A.8": { name: "Technological Controls", description: "Technical security" }
        };
        
        const domains = domainIds.map((domainId: string) => {
          const domainInfo = domainNames[domainId] || { name: domainId, description: "" };
          const domainControls = controlsData.controls.filter((c: any) => c.domainId === domainId);
          return {
            id: domainId,
            code: domainId,
            name: domainInfo.name,
            description: domainInfo.description,
            controlCount: domainControls.length
          };
        });

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

        // Create project if not loaded from server
        if (!project) {
          const newProject: Project = {
            id: `project-${Date.now()}`,
            name: "My ISO 27001 Project",
            frameworkId: "iso27001",
            answers: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setProject(newProject);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authenticated, userId, authSession]);

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

  const handleSaveAnswer = async (answer: Partial<Answer>) => {
    if (!project || !selectedControl || !userId || !authSession) return;

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
    
    // Save to server (secure JSON storage)
    try {
      await fetch("/api/auth/save-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          session: authSession,
          data: updatedProject,
        }),
      });
    } catch (error) {
      console.error("Failed to save assessment:", error);
    }
    
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

  // Show authentication gate if not authenticated (check this FIRST)
  if (!authenticated) {
    return <AuthGate onAuthenticated={handleAuthenticated} />;
  }

  // Show loading only after authentication
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
              userName={authSession?.email || "User"}
              userId={userId}
              onNavigateToDomains={() => setCurrentView("domains")}
              onNavigateToControls={() => setCurrentView("controls")}
              onLogout={handleLogout}
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
