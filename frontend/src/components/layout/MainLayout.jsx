import { useState, useEffect } from 'react';
import { Home, BarChart2, Users, Settings, Menu, X, Terminal, Moon, Sun, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarLink = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`group flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 ${
      active
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
        : "text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400"
    }`}
  >
    <div className="flex items-center space-x-3">
      <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`} />
      <span className="font-semibold text-sm tracking-wide">{label}</span>
    </div>
    {active && <ChevronRight className="w-4 h-4 opacity-70" />}
  </button>
);

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
      <div className="max-w-8xl mx-auto flex">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        <aside
          className={`fixed lg:sticky top-0 h-screen z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } flex flex-col`}
        >
          <div className="h-24 flex items-center px-8 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                <Terminal className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-gray-900 dark:text-white tracking-tight leading-none">CP ANALYTICS</span>
                <span className="text-[10px] font-bold text-indigo-500 tracking-[0.2em] mt-1 uppercase">Engine v1.0</span>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <div>
              <p className="px-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-4">Main Menu</p>
              <div className="space-y-1">
                <SidebarLink icon={Home} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
                <SidebarLink icon={Users} label="Compare" active={activeTab === 'Compare'} onClick={() => setActiveTab('Compare')} />
                <SidebarLink icon={BarChart2} label="Trends" active={activeTab === 'Trends'} onClick={() => setActiveTab('Trends')} />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="px-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-4">Preferences</p>
              <SidebarLink icon={Settings} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
            </div>
          </nav>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800 flex items-center px-8">
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium">Pages</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-gray-900 dark:text-white font-bold">{activeTab}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center px-4 py-2 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20 text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />
                  Live Engine
                </div>
                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-all active:scale-90"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 md:p-8 lg:p-10">
             <div className="max-w-8xl mx-auto">
                {children}
             </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;