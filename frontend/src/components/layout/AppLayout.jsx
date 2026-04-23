import { useState }  from 'react';
import { Outlet }    from 'react-router-dom';
import { motion }    from 'framer-motion';
import Sidebar        from './Sidebar';
import Navbar         from './Navbar';
import Chatbot        from '@/components/Chatbot';
import Footer         from '@/components/layout/Footer';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarOpen ? 'mobile-open' : ''}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(v => !v)} />

        {/* Scrollable area with footer */}
        <div className="flex-1 overflow-y-auto">
        <main className="p-4 md:p-6 min-h-[calc(100vh-4rem-48px)] pb-24 md:pb-32">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>

      {/* Global floating chatbot */}
      <Chatbot />
    </div>
  );
}