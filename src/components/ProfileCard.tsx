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
}

function ProfileCard(props: Props) {
  const { 
    fullName, 
    username, 
    email, 
    profilePicture, 
    role, 
    memberSince = "2025" // Default if not provided
  } = props;

  // Calculate level based on XP (example: 1000 XP per level)

  const router = useRouter();

  return (
    <div 
    className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-transform duration-300 cursor-pointer"
    
    >
      {/* Profile Header */}
      <div 
      className="bg-gradient-to-r from-blue-60 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-6 hover:bg-gradient-to-r hover:from-blue-70 hover:to-indigo-100 transition-colors duration-300"
      onClick={() => router.push('/my-dashboard')}
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
            {role === 'admin' && (
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
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <p className="font-semibold text-indigo-600 dark:text-indigo-400">
              {props.isVerified ? 'Verified' : 'Unverified'}
            </p>
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