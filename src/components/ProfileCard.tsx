'use client'
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
interface Props {
  fullName: string;
  username: string;
  email: string;
  profilePicture: string | null;
  phone: string;
  isVerified: boolean;
  role: string;
  gender: string;
  memberSince?: string;
  totalClassAttended?: number;
  skills?: string[] | null;
  xps?: number | null
}

const handleVerify = () => {
  console.log('Verify');
}

function ProfileCard(props: Props) {
  const {
    fullName,
    username,
    email,
    profilePicture,
    role,
    memberSince = "2025", // Default if not provided
    totalClassAttended = 0, // Default if not provided
    xps = 0,
    skills = [],
    isVerified = false
  } = props;

  // Calculate level based on XP (example: 1000 XP per level)

  const router = useRouter();

  return (
    <div
      className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-transform duration-300 cursor-pointer"

    >
      {/* Profile Header */}
      <div
        className="bg-gradient-to-r from-blue-60 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6 hover:bg-gradient-to-r hover:from-blue-70 hover:to-indigo-100 transition-colors duration-300 dark:hover:from-gray-800 dark:hover:to-gray-700"
        onClick={() => router.push('/home')}
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            {profilePicture ? (
              <Image
                src={profilePicture}
                alt={fullName}
                width={80}
                height={80}
                className="rounded-full border-4 border-white dark:border-gray-800 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold">
                {fullName.charAt(0)}
              </div>
            )}
            {role === 'Admin' && (
              <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                Admin
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</h2>
            <p className="text-gray-600 dark:text-gray-300">@{username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span className="inline-flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {email}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-6">


        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
            <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
            <p className="font-semibold text-gray-900 dark:text-white">{memberSince}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
            <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
            <p className="font-semibold text-gray-900 dark:text-white capitalize">{role}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
            <p className="text-sm text-gray-500 dark:text-gray-400">Classroom</p>
            <p className="font-semibold text-indigo-600 dark:text-indigo-400">
              {totalClassAttended}
            </p>
          </div>
          {role === 'Student' && (<div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
            <p className="text-sm text-gray-500 dark:text-gray-400">Xps</p>
            <p className="font-semibold text-indigo-600 dark:text-indigo-400">
              {xps}
            </p>
          </div>)}
          {role === 'Teacher' && (<div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
            <p className="text-sm text-gray-500 dark:text-gray-400">Skills</p>
            <p className="font-semibold text-indigo-600 dark:text-indigo-400">
              {skills?.join(', ')}
            </p>
          </div>)}
          <div className={`inline-flex items-center px-3 py-2 rounded-lg border transition-all duration-200 ${isVerified
              ? 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-600 text-green-800 dark:text-green-200'
              : 'bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-600 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800/60 cursor-pointer'
            }`}>
            {isVerified ? (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Verified</span>
              </>
            ) : (
              <button
                onClick={handleVerify}
                className="flex items-center group"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium group-hover:underline">Verify</span>
              </button>
            )}
          </div>

        </div>

        {/* Contact Info (hidden on small screens) */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 hidden sm:block">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            {props.phone || 'Not provided'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;