'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface UserData {
  username: string;
  realName: string;
  studentNumber: string;
  email: string;
  balance: number;
}

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

// Function to check user

const checkUserData = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      console.log('User data exists:', {
        id: userId,
        ...userDoc.data()
      });
      return true;
    } else {
      console.log('No user document found for ID:', userId);
      return false;
    }
  } catch (error) {
    console.error('Error checking user data:', error);
    return false;
  }
};

// Temporary Button to check user data
<button
  onClick={() => checkUserData(user?.uid || '')}
  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
>
  Check Data
</button>

  useEffect(() => {
    async function fetchUserData() {
      try {
        if (!user) {
          console.log('No user found, redirecting...');
          router.push('/');
          return;
        }

        console.log('Fetching data for user:', user.uid);
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          console.log('No user document found');
          setError('User profile not found');
          return;
        }

        const data = userDoc.data() as UserData;
        console.log('Fetched user data:', data);
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#3B6DA5] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="text-2xl text-gray-800">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#3B6DA5] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl text-red-600 mb-4">{error}</h2>
          <p className="text-gray-600 mb-4">
            There was an error loading your profile. Please try logging out and back in.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Return to Home
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#3B6DA5] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="text-xl text-red-600 mb-4">Profile not found</div>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#3B6DA5] flex flex-col items-center p-6">
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full mt-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Profile
        </h1>
        
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-sm text-gray-500">Username</h2>
            <p className="text-lg font-semibold">{userData.username}</p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-sm text-gray-500">Full Name</h2>
            <p className="text-lg font-semibold">{userData.realName}</p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-sm text-gray-500">Student Number</h2>
            <p className="text-lg font-semibold">{userData.studentNumber}</p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-sm text-gray-500">Email</h2>
            <p className="text-lg font-semibold">{userData.email}</p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-sm text-gray-500">Rebottle Dollar: </h2>
            <p className="text-lg font-semibold text-green-600">${userData.balance.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#3B6DA5] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}