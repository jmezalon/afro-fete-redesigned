import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import logo from '../assets/logo/logo.png';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SignIn = () => {
  const { signIn } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous error
    setAuthError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(formData.email, formData.password);
      // PublicRoute will handle the redirect automatically
    } catch (error) {
      console.error('Sign in error:', error);

      // Extract error message from various possible error formats
      let errorMessage = 'Failed to sign in. Please try again.';

      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.code) {
        // Handle Firebase error codes
        errorMessage = getFirebaseErrorMessage(error.code);
      }

      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert Firebase error codes to user-friendly messages
  const getFirebaseErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email. Please sign up first.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password. Please try again.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };

    return errorMessages[errorCode] || 'Failed to sign in. Please try again.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">

            {/* Left Side - Visual/Branding */}
            <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-[#FF6B6B] via-[#FF8E8E] to-[#FFB4B4] rounded-3xl p-12 text-white min-h-[600px] relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="mb-8">
                  <img src={logo} alt="Afro-fete" className="h-16 w-auto" />
                </div>

                <h2 className="text-4xl font-bold mb-4 leading-tight">
                  Welcome Back to the Vibe!
                </h2>

                <p className="text-white/90 text-lg mb-8 leading-relaxed">
                  Sign in to discover amazing Afro-Caribbean events, connect with your community, and never miss a beat.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span>Discover trending events</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span>Save your favorite vibes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span>Connect with the community</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
                {/* Mobile Logo */}
                <div className="lg:hidden flex justify-center mb-6">
                  <img src={logo} alt="Afro-fete" className="h-16 w-auto" />
                </div>

                <div className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Log In</h1>
                  <p className="text-sm sm:text-base text-gray-600">Welcome back! Please enter your details.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                        errors.email || authError ? 'text-red-500' : 'text-gray-400'
                      }`} />
                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 border ${
                          errors.email || authError ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent focus:bg-white transition-all`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-[#FF6B6B] hover:text-[#ff5252] font-medium"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                        errors.password || authError ? 'text-red-500' : 'text-gray-400'
                      }`} />
                      <input
                        type="password"
                        name="password"
                        placeholder="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 border ${
                          errors.password || authError ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent focus:bg-white transition-all`}
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Auth Error Message */}
                  {authError && authError.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-red-800 mb-1">
                            Sign In Failed
                          </h3>
                          <p className="text-sm text-red-700">
                            {authError}
                          </p>
                        </div>
                        <button
                          onClick={() => setAuthError('')}
                          className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                          aria-label="Dismiss error"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:from-[#ff5252] hover:to-[#FF6B6B] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group shadow-lg hover:shadow-xl"
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
                        Signing in...
                      </>
                    ) : (
                      <>
                        <span>Log In</span>
                        <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <Link
                      to="/signup"
                      className="text-[#FF6B6B] hover:text-[#ff5252] font-semibold transition-colors"
                    >
                      Sign up for free
                    </Link>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignIn;
