import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail, MapPin } from 'lucide-react';
import logo from '../assets/logo/logo.png';

const Footer = () => {
  const footerSections = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'How It Works', path: '/how-it-works' },
      { name: 'Contact Us', path: '/contact' },
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
    ],
  };

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/afrofete', color: 'hover:text-pink-400' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/afrofete', color: 'hover:text-blue-400' },
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/afrofete', color: 'hover:text-blue-500' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4 bg-[#141b2b] px-4 py-2 rounded-lg">
              <img
                src={logo}
                alt="Afro-fete Logo"
                className="h-12 w-auto transition-transform duration-200 hover:scale-105"
              />
            </Link>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Discover and connect with the vibrant Afro-Caribbean community through unforgettable events.
            </p>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span>New York, NY</span>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              {footerSections.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-[#FF6B6B] transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              {footerSections.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-[#FF6B6B] transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Connect</h3>
            <p className="text-gray-400 text-sm mb-4">
              Follow us for the latest events and updates
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 ${social.color} transition-all duration-200 hover:scale-110 hover:bg-gray-700`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <a
              href="mailto:hello@afrofete.com"
              className="mt-4 flex items-center gap-2 text-gray-400 hover:text-[#FF6B6B] transition-colors text-sm"
            >
              <Mail className="w-4 h-4" />
              <span>hello@afrofete.com</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Afro-fete. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link to="/sitemap" className="hover:text-white transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
