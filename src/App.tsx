import type { ReactElement } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Components/Sidebar';
import ProfilePage from './Pages/Authentication/Perfil';
import { Diagrama } from './Pages/Diagramador/Diagrama';
import LoginPage from './Pages/Authentication/LoginPage';
import RegisterPage from './Pages/Authentication/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Componente de wrapper para proteger rutas
const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Componente de layout para páginas autenticadas
const AuthenticatedLayout = ({ children }: { children: ReactElement }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-16 sm:ml-56 min-h-screen bg-gray-50">
        <main className="w-full h-full">
          {children}
        </main>
      </div>
    </div>
  );
};

// Componente interno de la aplicación que usa el contexto de autenticación
const AppContent = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Rutas protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <Navigate to="/disenio" replace />
          </ProtectedRoute>
        } />
        
        <Route path="/disenio" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Diagrama />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/perfil" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ProfilePage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/diseño/:proyectoId" element={
          <AuthenticatedLayout>
            <Diagrama />
          </AuthenticatedLayout>
        } />
        
        {/* Redireccionar rutas desconocidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
