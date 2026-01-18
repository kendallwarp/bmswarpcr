import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { UserMenu } from './UserMenu';
import { Moon, Sun, Globe, Menu } from 'lucide-react';
import { ImportModal } from './ImportModal';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface LayoutProps {
    children: React.ReactNode;
    currentView: 'calendar' | 'dashboard' | 'settings';
    setView: (v: 'calendar' | 'dashboard' | 'settings') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage } = useLanguage();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [showImport, setShowImport] = useState(false);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'es' : 'en');
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar with mobile props */}
            {/* @ts-ignore */}
            <Sidebar
                currentView={currentView}
                setView={(view) => {
                    setView(view);
                    setSidebarOpen(false); // Close on selection on mobile
                }}
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onShowImport={() => {
                    setShowImport(true);
                    setSidebarOpen(false); // Close sidebar on mobile
                }}
            />

            <main className="flex-1 overflow-hidden flex flex-col relative w-full">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-lg text-gray-800 dark:text-white">Warp CR</span>
                    <div className="w-8" /> {/* Spacer for centering if needed, or keep alignment */}
                </div>

                {/* Desktop Controls (Absolute) - adjusted top for mobile to not overlap or be hidden */}
                <div className="absolute top-4 right-4 z-20 flex gap-2 items-center hidden md:flex">
                    <button
                        onClick={toggleLanguage}
                        className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
                    >
                        <span className="font-bold text-xs flex items-center gap-1">
                            <Globe size={14} /> {language.toUpperCase()}
                        </span>
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <UserMenu />
                </div>

                {/* Mobile Controls (Inline in header or separate row? keeping them in header might be crowded. 
                    Let's just show them in the top right of the mobile header for now, simplifying.) 
                */}

                {/* Re-implementing Mobile Header to include the existing controls if possible, or keeping them separate. 
                     Let's make the absolute controls visible on mobile but positioned differently? 
                     Actually the mobile header I just added covers the top. 
                     Let's put the controls INSIDE the new mobile header for mobile view.
                 */}

                {/* Retrying the Mobile Header part to be cleaner and reuse controls */}
                <div className="md:hidden absolute top-4 right-4 z-20 flex gap-2 items-center">
                    {/* Simplified mobile controls */}
                    <UserMenu />
                </div>


                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto p-4 md:p-6 pt-4 md:pt-16 relative">
                    {children}
                </div>
            </main>

            {showImport && <ImportModal onClose={() => setShowImport(false)} />}
        </div>
    );
};
