'use client';
import { useRouter } from 'next/navigation';

export default function Leaderboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#3B6DA5] flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Page Under Construction
        </h1>
        <p className="text-gray-600 mb-8">
          We'll be back soon !!
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-[#3B6DA5] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}