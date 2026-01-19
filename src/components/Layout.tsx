
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { UserMenu } from './UserMenu';
import { Moon, Sun, Globe, Menu } from 'lucide-react';
import { ImportModal } from './ImportModal';
import { ExportModal } from './ExportModal';
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
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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
            <Sidebar
                currentView={currentView}
                setView={(view) => {
                    setView(view);
                    setSidebarOpen(false);
                }}
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onShowImport={() => {
                    setIsImportModalOpen(true);
                    setSidebarOpen(false);
                }}
                onShowExport={() => {
                    setIsExportModalOpen(true);
                    setSidebarOpen(false);
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
                    <div className="flex items-center gap-2">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <UserMenu />
                    </div>
                </div>

                {/* Desktop Controls (Absolute) */}
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

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto p-4 md:p-6 pt-4 md:pt-16 relative">
                    {children}
                </div>
            </main>

            {isImportModalOpen && (
                <ImportModal onClose={() => setIsImportModalOpen(false)} />
            )}
            {isExportModalOpen && (
                <ExportModal onClose={() => setIsExportModalOpen(false)} />
            )}
        </div>
    );
};
