import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  MessageCircle, 
  User,
  LogOut
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/create-job':
        return 'Create Mail Job';
      case '/job-tracking':
        return 'Job Tracking';
      case '/job-history':
        return 'Job History';
      case '/order-history':
        return 'Order History';
      case '/create-letter':
        return 'Create Letter';
      case '/templates':
        return 'Templates';
      default:
        return 'Dashboard';
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {/* Left side - Page title */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
      </div>

      {/* Center - Search bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right side - Actions and user */}
      <div className="flex items-center space-x-4">
        {/* Create button */}
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          Create
        </button>

        {/* Notifications */}
        <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <Bell className="w-4 h-4 text-gray-600" />
        </button>

        {/* Messages */}
        <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <MessageCircle className="w-4 h-4 text-gray-600" />
        </button>

        {/* User profile dropdown */}
        <div className="relative group">
          <button className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          </button>
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">User</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
