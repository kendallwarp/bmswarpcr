import { useState } from 'react';
import { Layout } from './components/Layout';
import { Calendar } from './components/Calendar';
import { KPIDashboard } from './components/KPIDashboard';
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

            <Layout currentView={view} setView={setView}>
              {view === 'calendar' ? <Calendar /> : view === 'dashboard' ? <KPIDashboard /> : <div className="p-10 text-center text-gray-500">Settings Module Coming Soon</div>}
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
