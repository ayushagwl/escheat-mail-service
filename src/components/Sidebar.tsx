import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Upload, 
  BarChart3, 
  FileText, 
  MessageCircle,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      current: location.pathname === '/'
    },
    {
      name: 'Create Mail Job',
      href: '/create-job',
      icon: Upload,
      current: location.pathname === '/create-job'
    },
    {
      name: 'Job History',
      href: '/job-history',
      icon: FileText,
      current: location.pathname === '/job-history'
    },
    {
      name: 'Templates',
      href: '/templates',
      icon: FileText,
      current: location.pathname === '/templates'
    },
    {
      name: 'Job Tracking',
      href: '/job-tracking',
      icon: BarChart3,
      current: location.pathname === '/job-tracking'
    },
    {
      name: 'Create Letter',
      href: '/create-letter',
      icon: FileText,
      current: location.pathname === '/create-letter'
    }
  ];

  if (!user) return null;

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900">Escheat Mail</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                item.current
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Icons */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <MessageCircle className="w-4 h-4 text-gray-600" />
          </button>
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Moon className="w-4 h-4 text-gray-600" />
          </button>
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Sun className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
