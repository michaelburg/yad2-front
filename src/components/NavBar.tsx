import React from 'react';
import { Building, Heart, X, Shuffle, Info, User, LogOut } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { Button } from './ui/button';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { path: '/liked', label: 'Liked', icon: Heart, color: 'text-red-500' },
  { path: '/dislike', label: 'Dislike', icon: X, color: 'text-red-600' },
  { path: '/explore', label: 'Explore', icon: Shuffle, color: 'text-blue-500' },
  { path: '/about', label: 'About Us', icon: Info, color: 'text-green-500' },
];

const NavItem: React.FC<{
  item: NavigationItem;
  isActive: boolean;
  isMobile?: boolean;
}> = ({ item, isActive, isMobile = false }) => {
  const IconComponent = item.icon;

  const baseClasses = `transition-all duration-200 ${
    isActive ? 'bg-[#2A2A2A] shadow-md' : 'hover:bg-[#2A2A2A]/50'
  }`;

  const mobileClasses = `p-2 rounded-lg ${baseClasses} ${
    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
  }`;
  const desktopClasses = `flex items-center gap-2 px-3 py-2 rounded-lg ${baseClasses} ${
    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
  }`;

  return (
    <Link to={item.path} className={isMobile ? mobileClasses : desktopClasses}>
      <IconComponent
        size={isMobile ? 18 : 16}
        className={isActive ? item.color : 'text-current'}
      />
      {!isMobile && <span className="text-sm font-medium">{item.label}</span>}
    </Link>
  );
};

const UserInfo: React.FC<{
  user: any;
  onLogout: () => void;
  isMobile?: boolean;
}> = ({ user, onLogout, isMobile = false }) => {
  if (isMobile) {
    return (
      <Button
        onClick={onLogout}
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white"
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-gray-400">
        <User size={16} className="text-blue-500" />
        <span className="text-sm font-medium">{user?.name || 'User'}</span>
      </div>
      <Button
        onClick={onLogout}
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
};

const AppLogo: React.FC = () => (
  <div className="flex items-center gap-3">
    <Building size={28} className="text-blue-500" />
    <h1 className="text-2xl font-bold text-white">Yad3</h1>
  </div>
);

const NavBar: React.FC = () => {
  const location = useLocation();
  const { logout, user, isAuthenticated } = useAuthContext();

  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#1E1E1E] border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <AppLogo />

          <div className="hidden md:flex items-center gap-6">
            {NAVIGATION_ITEMS.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
              />
            ))}

            {isAuthenticated && <UserInfo user={user} onLogout={logout} />}
          </div>

          <div className="md:hidden">
            <div className="flex items-center gap-2">
              {NAVIGATION_ITEMS.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  isMobile
                />
              ))}

              {isAuthenticated && (
                <UserInfo user={user} onLogout={logout} isMobile />
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
