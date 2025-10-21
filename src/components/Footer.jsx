import { Link } from 'react-router-dom';
import logo from '../assets/logo/logo.png';

const Footer = () => {
  const footerLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Site Map', path: '/sitemap' },
  ];

  return (
    <footer className="bg-[#2D2D2D] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo on Left */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Afro-fete Logo"
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>

          {/* Links on Right */}
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {footerLinks.map((link, index) => (
              <span key={link.path} className="flex items-center">
                <Link
                  to={link.path}
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  {link.name}
                </Link>
                {index < footerLinks.length - 1 && (
                  <span className="ml-8 text-gray-500">|</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Optional Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Afro-fete. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
