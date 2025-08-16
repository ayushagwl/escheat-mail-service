import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const Navbar: React.FC = () => {

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-primary-600">
            <Mail className="h-8 w-8" />
            <span>Escheat Mail</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
