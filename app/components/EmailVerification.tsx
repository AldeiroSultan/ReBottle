'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function EmailVerification() {
  const { user, resendVerificationEmail } = useAuth();
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer, canResend]);

  const handleResend = async () => {
    try {
      await resendVerificationEmail();
      setCanResend(false);
      setTimer(60);
    } catch (error) {
      console.error('Error resending verification:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#3B6DA5] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Verify Your Email
        </h2>
        <p className="text-gray-600 mb-6">
          Please check your email and verify your account to continue.
        </p>
        {canResend ? (
          <button
            onClick={handleResend}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Resend Verification Email
          </button>
        ) : (
          <p className="text-gray-500">
            Resend available in {timer} seconds
          </p>
        )}
        <button
          onClick={() => router.push('/')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}