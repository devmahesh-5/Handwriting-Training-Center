'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
interface Props {
    _id?: string;
    title: string;
    instruction?: string;
    difficulty?: string;
    tags?: string[];
    xpReward?: number;
    onStart?: () => void;
}

function PracticeCard(props: Props) {
    
    const { title, instruction, difficulty, tags, xpReward, _id} = props;
    const router = useRouter();
    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
            <div className="p-6">
                {/* Header section */}
                <div className="flex justify-between items-start gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                        {title}
                    </h3>
                    {difficulty && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            difficulty === 'Beginner' 
                                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : difficulty === 'Intermediate'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                            {difficulty}
                        </span>
                    )}
                </div>

                {/* instruction */}
                {instruction && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 line-clamp-3 leading-relaxed">
                        {instruction}
                    </p>
                )}

                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {tags.map((tag, index) => (
                            <span 
                                key={index} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div className="flex items-center">
                        {xpReward && (
                            <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                                <span className="flex items-center justify-center w-5 h-5 mr-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded-full text-xs">
                                    ★
                                </span>
                                {xpReward} XP
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={()=>{router.push(`/practices/view/${_id}`)
                        }}
                        className="relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 cursor-pointer"
                    >
                        View

                        <svg className="ml-1.5 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PracticeCard;