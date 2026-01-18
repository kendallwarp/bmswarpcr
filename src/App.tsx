import { useState } from 'react';
import { Layout } from './components/Layout';
import { Calendar } from './components/Calendar';
import { KPIDashboard } from './components/KPIDashboard';
import { SettingsView } from './components/SettingsView';
import { Login } from './pages/Login';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { BrandProvider } from './context/BrandContext';
import { PostProvider } from './context/PostContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const [view, setView] = useState<'calendar' | 'dashboard' | 'settings'>('calendar');
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login />;
  }

  // Show main app if authenticated
  return (
    <LanguageProvider>
      <BrandProvider>
        <PostProvider>
          <ThemeProvider>
            {/* @ts-ignore - passing props effectively */}
            <Layout currentView={view} setView={setView}>
              {view === 'calendar' ? <Calendar /> : view === 'dashboard' ? <KPIDashboard /> : <SettingsView />}
            </Layout>
          </ThemeProvider>
        </PostProvider>
      </BrandProvider>
    </LanguageProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
