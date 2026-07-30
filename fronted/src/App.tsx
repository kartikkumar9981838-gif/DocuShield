import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Workspace } from './components/Workspace';
import { ViewMode, ToolType } from './types';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [initialTool, setInitialTool] = useState<ToolType>('none');

  const handleOpenWorkspace = (tool: ToolType = 'none') => {
    setInitialTool(tool);
    setViewMode('workspace');
  };

  const handleBackToHome = () => {
    setViewMode('landing');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1A202C]">
      {viewMode === 'landing' ? (
        <LandingPage onOpenWorkspace={handleOpenWorkspace} />
      ) : (
        <Workspace initialTool={initialTool} onBackToHome={handleBackToHome} />
      )}
    </div>
  );
}
