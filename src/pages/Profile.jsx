import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="font-serif text-4xl text-gray-900 mb-6">Profile</h1>

          <div className="space-y-4 mb-8">
            <div className="border-b pb-4">
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg text-gray-900">{user?.email}</p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-600">Username</p>
              <p className="text-lg text-gray-900">{user?.username || 'Not set'}</p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="text-lg text-gray-900">{user?.fullName || 'Not set'}</p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-600">Account Type</p>
              <p className="text-lg text-gray-900 capitalize">{user?.userType || 'Not set'}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="bg-coral hover:bg-coral-dark text-white font-medium py-3 px-8 rounded-full transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
