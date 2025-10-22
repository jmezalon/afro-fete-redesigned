import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo/logo.png';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Photo Gallery', path: '/photos' },
    { name: 'Hashtags', path: '/hashtags' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      setDropdownOpen(false);
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getUserInitials = () => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 group">
            <img src={logo} alt="Afro-fete Logo" className="h-12 w-auto transition-transform duration-200 group-hover:scale-105" />
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-[#FF6B6B] transition-all duration-200 font-medium text-sm relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B6B] transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section - Right */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full bg-[#FF6B6B] text-white font-semibold flex items-center justify-center hover:bg-[#ff5252] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2"
                  aria-label="User menu"
                >
                  {getUserInitials()}
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/signin">
                  <button className="px-6 py-2.5 text-gray-700 font-medium hover:text-[#FF6B6B] transition-all duration-200 text-sm">
                    Log In
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-6 py-2.5 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 rounded-md text-gray-700 hover:text-[#FF6B6B] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6B6B]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
            {/* Mobile User Section */}
            {user && (
              <div className="flex items-center justify-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 rounded-full bg-[#FF6B6B] text-white font-semibold flex items-center justify-center">
                  {getUserInitials()}
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {user.fullName || user.email}
                </p>
              </div>
            )}

            {/* Mobile Nav Links */}
            <div className="flex flex-col items-center space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-700 hover:text-[#FF6B6B] transition-colors duration-200 font-medium text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-gray-200 flex flex-col items-center space-y-3 max-w-sm mx-auto w-full">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="block w-full text-center px-6 py-3 border-2 border-[#FF6B6B] text-[#FF6B6B] rounded-lg font-medium hover:bg-[#FF6B6B] hover:text-white transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-6 py-3 bg-[#FF6B6B] text-white rounded-lg font-medium hover:bg-[#ff5252] transition-colors duration-200"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="block w-full text-center px-6 py-3 border-2 border-[#FF6B6B] text-[#FF6B6B] rounded-lg font-medium hover:bg-[#FF6B6B] hover:text-white transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full text-center px-6 py-3 bg-[#FF6B6B] text-white rounded-lg font-medium hover:bg-[#ff5252] transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
