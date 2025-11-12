import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  isExpanded: boolean;
  toggleCollapse: () => void;
  setHoverExpanded: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsedState, setCollapsedState] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setCollapsedState(savedState === "true");
    }
  }, []);

  const isExpanded = !collapsedState || hoverExpanded;
  const layoutCollapsed = collapsedState && !hoverExpanded;

  useEffect(() => {
    document.body.classList.toggle("sidebar-expanded", isExpanded);
    document.body.classList.toggle("sidebar-collapsed", !isExpanded);
  }, [isExpanded]);

  const toggleCollapse = () => {
    const newState = !collapsedState;
    setCollapsedState(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed: layoutCollapsed, isExpanded, toggleCollapse, setHoverExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

