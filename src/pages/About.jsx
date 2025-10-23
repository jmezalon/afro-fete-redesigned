import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Users, Heart, Globe, Calendar } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Community First',
      description: 'We believe in bringing people together to celebrate African culture and create lasting connections.',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Cultural Celebration',
      description: 'Showcasing the rich diversity and vibrancy of African cultures through events and experiences.',
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Memorable Experiences',
      description: 'Curating exceptional events that create unforgettable moments and celebrations.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Inclusive Platform',
      description: 'Building a welcoming space where everyone can discover and participate in African cultural events.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Afro-fete</h1>
            <p className="text-xl md:text-2xl leading-relaxed opacity-95">
              Your premier destination for discovering and celebrating African cultural events,
              bringing communities together through unforgettable experiences.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Afro-fete was created with a simple yet powerful vision: to make it easy for people
                to discover, share, and participate in African cultural events. We're passionate about
                celebrating the rich diversity of African cultures and creating spaces where communities
                can come together.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Whether it's a vibrant music festival, an art exhibition, a cultural celebration, or a
                community gathering, we're here to connect you with experiences that inspire, educate,
                and bring joy. Our platform empowers event organizers to reach wider audiences while
                helping attendees discover events that resonate with their interests.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="flex flex-col items-start p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] rounded-lg flex items-center justify-center text-white mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-8 md:p-12 text-white">
              <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
              <p className="text-lg leading-relaxed mb-6 opacity-95">
                Afro-fete began with a simple observation: amazing African cultural events were
                happening all around us, but finding them was often a challenge. Friends would discover
                incredible festivals and celebrations only after they had passed, or through word of mouth
                at the last minute.
              </p>
              <p className="text-lg leading-relaxed opacity-95">
                We set out to change that by creating a centralized platform where event organizers could
                showcase their events and where community members could easily discover what's happening.
                Today, Afro-fete has grown into a vibrant community hub, connecting thousands of people
                with the cultural experiences they love.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Our Community</h2>
            <p className="text-lg text-gray-700 mb-8">
              Be part of a growing community celebrating African culture through amazing events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Sign Up Now
              </Link>
              <Link
                to="/how-it-works"
                className="px-8 py-3 border-2 border-[#FF6B6B] text-[#FF6B6B] rounded-full font-semibold hover:bg-[#FF6B6B] hover:text-white transition-all duration-200"
              >
                Learn How It Works
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
