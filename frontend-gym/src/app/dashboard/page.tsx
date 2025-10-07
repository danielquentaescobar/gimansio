'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TablaUsuarios from '../../components/TablaUsuarios';
import TablaAdministrativos from '../../components/TablaAdministrativos';
import TablaMembresias from '../../components/TablaMembresias';
import TablaRegistroMembresias from '../../components/TablaRegistroMembresias';
import TablaPagos from '../../components/TablaPagos';
import '../../styles/dashboard.css';

interface Admin {
  id_admin: number;
  nombre: string;
  apellido: string;
  usuario: string;
  fecha_contratacion: string;
}

export default function Dashboard() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [activeTab, setActiveTab] = useState('usuarios');
  const [showAdminPanels, setShowAdminPanels] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const adminData = sessionStorage.getItem('admin');
    if (!adminData) {
      router.push('/');
      return;
    }
    setAdmin(JSON.parse(adminData));
  }, [router]);

  const handleLogoClick = () => {
    setShowAdminPanels(!showAdminPanels);
    if (showAdminPanels && (activeTab === 'administrativos' || activeTab === 'membresias')) {
      setActiveTab('usuarios');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin');
    router.push('/');
  };

  // Función para mostrar notificación de éxito
  const showNotification = (message: string) => {
    setNotificationMessage(message);
    setShowSuccessNotification(true);
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 3000);
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-purple-300">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'usuarios', name: 'Usuarios', icon: '👥', description: 'Gestión de usuarios' },
    { id: 'registros', name: 'Registros', icon: '📋', description: 'Inscripciones activas' },
    { id: 'pagos', name: 'Pagos', icon: '💰', description: 'Gestión financiera' },
    ...(showAdminPanels ? [
      { id: 'membresias', name: 'Membresías', icon: '🎯', description: 'Tipos de membresías' },
      { id: 'administrativos', name: 'Administrativos', icon: '👨‍💼', description: 'Administradores del sistema' }
    ] : [])
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'usuarios':
        return <TablaUsuarios />;
      case 'registros':
        return <TablaRegistroMembresias />;
      case 'pagos':
        return <TablaPagos />;
      case 'administrativos':
        return <TablaAdministrativos />;
      case 'membresias':
        return <TablaMembresias />;
      default:
        return <TablaUsuarios />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Notificación de éxito flotante */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">✅ {notificationMessage}</p>
            </div>
            <button 
              onClick={() => setShowSuccessNotification(false)}
              className="ml-4 text-green-200 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="dashboard-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLogoClick}
                className="flex items-center space-x-3 hover:bg-purple-800/20 p-2 rounded-lg transition-all duration-300 group"
                title={showAdminPanels ? "Ocultar paneles administrativos" : "Mostrar paneles administrativos"}
              >
                <img 
                  src="/images/logo.png" 
                  alt="Arena Gym Logo" 
                  className="w-10 h-10 rounded-xl shadow-lg object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Si la imagen no se encuentra, mostrar el SVG como fallback
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div 
                  className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                  style={{ display: 'none' }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">
                    ARENA GYM
                  </h1>
                  <p className="text-xs text-purple-300 group-hover:text-purple-200 transition-colors duration-300">
                    Sistema de Administración {showAdminPanels && '• Admin Panels'}
                  </p>
                </div>
              </button>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  {admin.nombre} {admin.apellido}
                </div>
                <div className="text-xs text-purple-300">
                  {admin.usuario}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Salir</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-purple-700/30 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {showAdminPanels && (
            <div className="text-center py-2 bg-purple-900/30 mb-2 rounded-lg">
              <span className="text-xs text-purple-300">
                🔐 Paneles Administrativos Activados (Membresías + Administradores) - Haz clic en el logo para ocultar
              </span>
            </div>
          )}
          <nav className="flex space-x-1 py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  dashboard-tab px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300
                  ${activeTab === tab.id ? 'active' : ''}
                  ${(tab.id === 'administrativos' || tab.id === 'membresias') ? 'ring-2 ring-purple-500/50' : ''}
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{tab.icon}</span>
                  <div className="text-left">
                    <div className="flex items-center space-x-1">
                      <span>{tab.name}</span>
                      {(tab.id === 'administrativos' || tab.id === 'membresias') && (
                        <span className="text-xs bg-purple-600 text-white px-1 py-0.5 rounded">ADMIN</span>
                      )}
                    </div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {tabs.find(tab => tab.id === activeTab)?.name}
                </h2>
                <p className="text-purple-300 mt-1">
                  {tabs.find(tab => tab.id === activeTab)?.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-300">
                  Último acceso: {new Date().toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card rounded-2xl overflow-hidden">
            {renderActiveComponent()}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-700/30 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto py-6 px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-purple-300">
                © 2025 By Qescob. Sistema profesional de gestión.
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-xs text-gray-500">
                Versión 2.0.0
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Sistema activo</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
