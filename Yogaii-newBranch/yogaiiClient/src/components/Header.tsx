import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  HomeIcon,
  AcademicCapIcon,
  VideoCameraIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const navigationItems = [
    { name: 'Ana Sayfa', href: '/home', icon: HomeIcon },
    { name: 'Yoga Pozları', href: '/poses', icon: AcademicCapIcon },
    { name: 'Canlı Tespit', href: '/live-detection', icon: VideoCameraIcon },
    { name: 'Yoga Serisi', href: '/streak', icon: FireIcon },
  ];

  return (
    <header className="bg-gradient-to-r from-purple-600 via-gray-500 to-blue-400 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={isAuthenticated ? "/home" : "/"} className="flex items-center group">
              <div className="relative">
                <img
                  src="/images/lotus (1).png"
                  alt="Lotus Icon"
                  className="w-10 h-10 mr-3 group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="font-poppins font-bold text-2xl text-white group-hover:text-yellow-100 transition-colors duration-300">
                YogaAII
              </span>
              <div className="ml-2 px-2 py-1 bg-white/20 rounded-full">
                <span className="text-xs font-medium text-white/90">AI</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 group"
                  >
                    <Icon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-blue-500 rounded-full flex items-center justify-center mr-2">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-medium hidden sm:block">{user?.username}</span>
                  <svg className="w-4 h-4 ml-2 text-white/70 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-white/90 hover:text-white border border-white/30 hover:border-white/50 rounded-lg transition-all duration-300"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/"
                  className="px-4 py-2 bg-white text-purple-600 hover:bg-yellow-100 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header; 