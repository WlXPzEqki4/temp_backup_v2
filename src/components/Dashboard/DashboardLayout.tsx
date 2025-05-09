import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import UserPermissionsDisplay from './UserPermissionsDisplay';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-indigo-600">Sentry View</h1>
        </div>
        <div className="px-4 py-2">
          <div className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-indigo-50 text-indigo-700">
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </div>
        </div>
        
        <div className="flex-1">
          {/* Widget Access Section - Updated heading */}
          <div className="px-4 mt-6">
            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-4">Classification & Releasability Controls</h3>
            
            {userData.username ? (
              <UserPermissionsDisplay username={userData.username} />
            ) : (
              <div className="text-sm text-gray-500">Not logged in</div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-indigo-100 p-2 rounded-full">
              <User size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-sm">{userData.username || 'User'}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-500 text-sm w-full mt-4"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Logged in as: <span className="font-medium">{userData.username}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
