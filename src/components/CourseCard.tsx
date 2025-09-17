'use client'
import { useRouter } from 'next/navigation';
import React from 'react';
interface Props {
    _id?: string;
    title: string;
    description: string;
    thumbnail: string;
    xp?: number; 
    duration?: string;
    isNew?: boolean 
}

function CourseCard(props: Props) {
    const { title, description, thumbnail, xp, duration, isNew } = props;
    const router = useRouter();
    return (
        <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 cursor-pointer h-56 hover:-translate-y-0.5 hover:shadow-lg ">
            {/* Thumbnail */}
           
            <div className="relative h-24 w-full">
                { isNew &&(<span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full z-10">
                New Course
                </span>)}
                <img
                    src={thumbnail} 
                    alt={title}
                    className="w-full h-full object-cover"
                />

                
                
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex flex-row justify-between">
                    <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                    {title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {description}
                </p>
                </div>

                <button 
                className="mt-4 h-10 bg-[#6C48E3] hover:bg-[#5A3BC9] text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6C48E3] focus:ring-offset-2 cursor-pointer" 
                onClick={() => router.push(`/courses/${props._id}`)}
                >
                    Enroll Now
                </button>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-sm">
                    {xp && (
                        <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <span className="mr-1">🌟</span>
                            {xp} XP
                        </span>
                    )}
                    
                    {duration && (
                        <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <span className="mr-1">⏱️</span>
                            {duration}
                        </span>
                    )}
                    
                </div>

                
            </div>
        </div>
    );
}

export default CourseCard;