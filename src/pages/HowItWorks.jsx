import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Search, Calendar, Users, Heart, Plus, Share2 } from 'lucide-react';

const HowItWorks = () => {
  const attendeeSteps = [
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Discover Events',
      description: 'Browse through our curated collection of African cultural events. Use filters to find events by category, date, or location that match your interests.',
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Save Your Favorites',
      description: 'Create an account to save events you\'re interested in. Get personalized recommendations and never miss out on events you love.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Attend & Connect',
      description: 'Show up and enjoy! Connect with other attendees, celebrate culture, and create lasting memories at amazing events.',
    },
  ];

  const organizerSteps = [
    {
      icon: <Plus className="w-8 h-8" />,
      title: 'Create Your Event',
      description: 'Sign up and create a detailed event listing with photos, descriptions, dates, and ticket information. Our easy-to-use platform makes event creation simple.',
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: 'Reach Your Audience',
      description: 'Your event gets featured to thousands of potential attendees actively looking for cultural experiences. Use hashtags to increase visibility.',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Build Community',
      description: 'Engage with your attendees, gather favorites, and build a loyal following for future events. Track engagement and grow your reach.',
    },
  ];

  const features = [
    {
      title: 'Smart Search & Filters',
      description: 'Find exactly what you\'re looking for with our powerful search and filtering system.',
    },
    {
      title: 'Event Categories',
      description: 'Browse by categories like Brunch, Festivals, Nightlife, Arts, Concerts, and more.',
    },
    {
      title: 'Photo Gallery',
      description: 'Get inspired by photos from past events and see what makes each experience special.',
    },
    {
      title: 'Favorites & Bookmarks',
      description: 'Save events for later and build your personal calendar of upcoming experiences.',
    },
    {
      title: 'Trending Hashtags',
      description: 'Discover popular events and trends in the community through hashtag exploration.',
    },
    {
      title: 'Mobile-Friendly',
      description: 'Access Afro-fete anywhere, anytime on your phone, tablet, or desktop.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">How Afro-fete Works</h1>
            <p className="text-xl md:text-2xl leading-relaxed opacity-95">
              Connecting event lovers with unforgettable African cultural experiences
              in just a few simple steps.
            </p>
          </div>
        </section>

        {/* For Attendees Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">For Event Attendees</h2>
              <p className="text-lg text-gray-600">
                Finding and attending amazing events has never been easier
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {attendeeSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-xl shadow-lg p-8 h-full hover:shadow-xl transition-shadow duration-300">
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-[#FF6B6B] mb-6 mt-4">
                      {step.icon}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Organizers Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">For Event Organizers</h2>
              <p className="text-lg text-gray-600">
                Share your events with a passionate community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {organizerSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-gray-50 rounded-xl shadow-lg p-8 h-full hover:shadow-xl transition-shadow duration-300">
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-[#4B5563] to-[#374151] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-[#FF6B6B] mb-6 mt-4">
                      {step.icon}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
              <p className="text-lg text-gray-600">
                Everything you need for a seamless event experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Is it free to use Afro-fete?
                </h3>
                <p className="text-gray-600">
                  Yes! Creating an account and browsing events is completely free. Event organizers
                  can also create and list their events for free.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  How do I purchase tickets?
                </h3>
                <p className="text-gray-600">
                  Event listings include ticket information and links. You'll be directed to the
                  event organizer's ticketing platform to complete your purchase.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Can I create an event?
                </h3>
                <p className="text-gray-600">
                  Absolutely! Sign up for an account, and you'll be able to create and manage your
                  own events. Share your cultural celebrations with our community.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  How do I stay updated on new events?
                </h3>
                <p className="text-gray-600">
                  Create an account to save your favorite events and get personalized recommendations.
                  You can also subscribe to our newsletter for updates on trending events.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg mb-8 opacity-95">
              Join thousands of people discovering and celebrating African culture through amazing events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Create Account
              </Link>
              <Link
                to="/"
                className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-all duration-200"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
