import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordReset } from '../services/authService';
import { Mail, ArrowRight, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo/logo.png';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors({});
    }
    setErrorMessage('');
    setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordReset(email);
      setSuccessMessage('Password reset email sent! Please check your inbox.');
      setEmail(''); // Clear the email field on success
    } catch (error) {
      console.error('Password reset error:', error);

      // Handle Firebase error codes
      let message = 'Failed to send reset email. Please try again.';

      if (error?.code) {
        const errorMessages = {
          'auth/user-not-found': 'No account found with this email address.',
          'auth/invalid-email': 'Please enter a valid email address.',
          'auth/too-many-requests': 'Too many attempts. Please try again later.',
          'auth/network-request-failed': 'Network error. Please check your connection.',
        };
        message = errorMessages[error.code] || message;
      } else if (error?.message) {
        message = error.message;
      }

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
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
                  Reset Your Password
                </h2>

                <p className="text-white/90 text-lg mb-8 leading-relaxed">
                  No worries! Enter your email address and we'll send you instructions to reset your password.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Check Your Email</p>
                      <p className="text-white/80 text-sm">We'll send you a secure reset link</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Create New Password</p>
                      <p className="text-white/80 text-sm">Follow the link to set a new password</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Back to the Vibe</p>
                      <p className="text-white/80 text-sm">Sign in and continue exploring events</p>
                    </div>
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

                {/* Back to Sign In Link */}
                <Link
                  to="/signin"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-[#FF6B6B] mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Sign In
                </Link>

                <div className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    No worries, we'll send you reset instructions.
                  </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-green-800 mb-1">
                          Email Sent Successfully
                        </h3>
                        <p className="text-sm text-green-700">
                          {successMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-800 mb-1">
                          Reset Failed
                        </h3>
                        <p className="text-sm text-red-700">
                          {errorMessage}
                        </p>
                      </div>
                      <button
                        onClick={() => setErrorMessage('')}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                        errors.email ? 'text-red-500' : 'text-gray-400'
                      }`} />
                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 border ${
                          errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

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
                        Sending...
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                {/* Sign In Link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Remember your password?{' '}
                    <Link
                      to="/signin"
                      className="text-[#FF6B6B] hover:text-[#ff5252] font-semibold transition-colors"
                    >
                      Sign in
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

export default ForgotPassword;
