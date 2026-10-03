import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#050816] text-white flex selection:bg-cyan-500 selection:text-black">
      {/* Ambient Cosmic Gradients */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-10 w-[30rem] h-[30rem] rounded-full bg-cyan-500/10 blur-[160px] pointer-events-none" />

      {/* Sidebar */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 relative z-10">
        <Navbar onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
