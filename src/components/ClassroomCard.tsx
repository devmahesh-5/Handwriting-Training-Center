'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
interface Teacher {
  fullName: string;
  profilePicture?: string;
}

interface Course {
  name: string;
  duration: string;
  thumbnail?: string;
}

interface Props {
  id?: string;
  title: string;
  xp: number;
  currentXp?: number;
  duration: string;
  course: Course;
  description?: string;
  teacher?: Teacher;
  status: 'active' | 'completed' | 'locked';
}

function ClassroomCard(props: Props) {
    const {
        id,
        title,
        currentXp = 0,
        xp,
        duration,
        course,
        description,
        teacher,
        status,
    }= props
     const progressPercentage = Math.min(Math.round((currentXp / xp) * 100), 100);
   
    const router = useRouter();
    console.log({props});
  return (
    
    <div 
      className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"
      
    >
      <div className="flex flex-col h-full">
        {/* Header with course title and status */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h1 className="text-sm font-medium text-gray-800 dark:text-gray-400 mb-1">Classroom</h1>
            {/* <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">
              {course.name}
            </p> */}
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-1">
              {title}
            </h3>
          </div>
          {status && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === 'active' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : status === 'completed'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )}
        </div>

        {/* Description (optional) */}
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Footer with metadata */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="mr-1.5">🌟</span>
              <span>
                <span className="font-medium">{currentXp}</span>/
                <span className="text-gray-500 dark:text-gray-400">{xp} XP</span>
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="mr-1.5">⏱️</span>
              {duration}
            </div>
          </div>

          {teacher && (
            <div className="flex items-center">
              {teacher.profilePicture ? (
                <img
                  src={teacher.profilePicture}
                  alt={teacher.fullName}
                  className="rounded-full mr-2 w-8 h-8"
                />
              ) : (
                <span className="mr-1.5">👨‍🏫</span>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {teacher.fullName || "Unknown Teacher"}
              </span>
            </div>
          )}
        </div>

        {/* Continue button - appears on hover */}
        <button 
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-[#F2F4F7] dark:hover:bg-indigo-600 text-[#60A5FA] py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center cursor-pointer"
          onClick={()=>router.push(`/my-classroom/${id}`)}
        >
          Continue Learning
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
};

export default ClassroomCard;