'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserCircle, Camera, Trophy } from 'lucide-react';
import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION, // Refer to .env.local
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '', 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '', 
  },
});

interface UserData {
  username: string;
  balance: number;
  bottlesScanned: number;
  email: string;
  realName: string;
  studentNumber: string;
}

export default function Dashboard(): JSX.Element {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    username: 'User',
    balance: 0,
    bottlesScanned: 0,
    email: '',
    realName: '',
    studentNumber: '',
  });

  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [rewardMessage, setRewardMessage] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
        }
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (showCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showCamera]);

  const startCamera = async (): Promise<void> => {
    setCameraError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve();
          }
        });
        await videoRef.current.play();
      }
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : 'Failed to access the camera');
    }
  };

  const stopCamera = (): void => {
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = async (): Promise<void> => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      await analyzeImage(imageData);
      setShowCamera(false);
    } catch (error) {
      setRewardMessage('Error capturing image. Please try again.');
    }
    setIsLoading(false);
  };

  const analyzeImage = async (imageData: string): Promise<void> => {
    if (!user) return;

    try {
      const imageBytes = Buffer.from(imageData.split(',')[1], 'base64');
      const command = new DetectLabelsCommand({
        Image: { Bytes: imageBytes },
        MaxLabels: 10,
        MinConfidence: 70,
      });

      const response = await rekognitionClient.send(command);
      const labels = response.Labels || [];

      const isBottle = labels.some(label =>
        label.Name?.toLowerCase().includes('bottle') || label.Name?.toLowerCase().includes('plastic')
      );
      const isCan = labels.some(label =>
        label.Name?.toLowerCase().includes('can') || label.Name?.toLowerCase().includes('aluminum')
      );

      let reward = 0;
      if (isBottle) {
        reward = 0.1;
        setRewardMessage('Plastic bottle detected! You have received $0.10');
      } else if (isCan) {
        reward = 0.5;
        setRewardMessage('Can detected! You have received $0.50');
      } else {
        setRewardMessage('No recyclable item detected. Please try again.');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const newBalance = userData.balance + reward;
      const newBottlesScanned = userData.bottlesScanned + 1;

      await updateDoc(userRef, {
        balance: newBalance,
        bottlesScanned: newBottlesScanned,
      });

      setUserData(prev => ({
        ...prev,
        balance: newBalance,
        bottlesScanned: newBottlesScanned,
      }));

    } catch (error) {
      setRewardMessage('Error analyzing image. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#3B6DA5] flex flex-col relative">
      <div className="p-6 text-white">
        <h1 className="text-4xl font-bold mb-8">Hi, {userData.username}!</h1>
      </div>

      <div className="mx-6 bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl text-gray-700 mb-2">Flex Dollar: </h2>
        <p className="text-5xl font-bold text-[#2C3E50]">
          {userData.balance.toFixed(2)}$
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center text-white p-6">
        <h3 className="text-2xl mb-4">You have deposited</h3>
        <p className="text-7xl font-bold mb-4">{userData.bottlesScanned}</p>
        <p className="text-2xl">Bottles !!</p>
      </div>

      <div className="fixed bottom-8 left-0 right-0 flex justify-center space-x-16">
        <button onClick={() => router.push('/leaderboard')} className="p-3 text-white">
          <Trophy size={32} />
        </button>
        <button
          onClick={() => setShowCamera(true)}
          className="p-3 text-white bg-[#3B6DA5] rounded-full border-4 border-white -mt-8"
        >
          <Camera size={32} />
        </button>
        <button onClick={() => router.push('/profile')} className="p-3 text-white">
          <UserCircle size={32} />
        </button>
      </div>

      {showCamera && (
        <div className="fixed inset-0 bg-black z-50">
          <div className="relative h-full">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={captureImage}
                  disabled={isLoading || !stream}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Take Picture'}
                </button>
                <button onClick={() => setShowCamera(false)} className="px-6 py-2 bg-red-500 text-white rounded-lg">
                  Cancel
                </button>
              </div>
            </div>

            {cameraError && (
              <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {cameraError}
              </div>
            )}
          </div>
        </div>
      )}

      {rewardMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded">
          {rewardMessage}
        </div>
      )}
    </div>
  );
}
