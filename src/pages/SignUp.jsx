import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo/logo.png';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    userType: 'partygoer',
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setAuthError('');
  };

  const handleUserTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      userType: type,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.username,
        formData.fullName,
        formData.userType
      );
      // Redirect to profile on success
      navigate('/profile');
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Heading with coral underline */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-5xl text-gray-900 mb-3">Sign Up</h1>
            <div className="w-3/4 h-0.5 bg-[#E57373] mx-auto"></div>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="Afro-fete" className="h-24 w-auto" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User Type Selection */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3 text-center">
                I am a ...
              </label>
              <div className="flex justify-center gap-8">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="partygoer"
                    checked={formData.userType === 'partygoer'}
                    onChange={() => handleUserTypeChange('partygoer')}
                    className="sr-only"
                  />
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 ${
                      formData.userType === 'partygoer'
                        ? 'border-coral'
                        : 'border-gray-400'
                    }`}
                  >
                    {formData.userType === 'partygoer' && (
                      <span className="w-3 h-3 rounded-full bg-coral"></span>
                    )}
                  </span>
                  <span className="text-gray-700">Partygoer</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="promoter"
                    checked={formData.userType === 'promoter'}
                    onChange={() => handleUserTypeChange('promoter')}
                    className="sr-only"
                  />
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 ${
                      formData.userType === 'promoter'
                        ? 'border-coral'
                        : 'border-gray-400'
                    }`}
                  >
                    {formData.userType === 'promoter' && (
                      <span className="w-3 h-3 rounded-full bg-coral"></span>
                    )}
                  </span>
                  <span className="text-gray-700">Promoter</span>
                </label>
              </div>
            </div>

            {/* Username Field */}
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-100 border ${
                  errors.username ? 'border-red-500' : 'border-transparent'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent transition-all`}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Full Name Field */}
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-100 border ${
                  errors.fullName ? 'border-red-500' : 'border-transparent'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent transition-all`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-100 border ${
                  errors.email ? 'border-red-500' : 'border-transparent'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent transition-all`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-100 border ${
                  errors.password ? 'border-red-500' : 'border-transparent'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent transition-all`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-100 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-transparent'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent transition-all`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Auth Error Message */}
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {authError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-coral hover:bg-coral-dark text-white font-medium py-3 px-4 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-gray-700">
            Already a member?{' '}
            <Link
              to="/signin"
              className="text-gray-900 underline hover:text-[#FF6B6B] transition-colors font-medium"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;
