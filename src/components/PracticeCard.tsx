import React from 'react';

interface Props {
    title: string;
    description?: string; // Optional description
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'; // Difficulty level
    tags?: string[]; // Optional tags
    xpReward?: number; // Optional XP reward
    onStart?: () => void; // Click handler
}

function PracticeCard(props: Props) {
    const { title, description, difficulty, tags, xpReward, onStart } = props;

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-5">
                {/* Header with title and difficulty */}
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {title}
                    </h3>
                    {difficulty && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            difficulty === 'Beginner' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : difficulty === 'Intermediate'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                            {difficulty}
                        </span>
                    )}
                </div>

                {/* Description */}
                {description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {description}
                    </p>
                )}

                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {tags.map((tag, index) => (
                            <span 
                                key={index} 
                                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer with XP and button */}
                <div className="flex justify-between items-center">
                    {xpReward && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="mr-1">🌟</span>
                            {xpReward} XP
                        </div>
                    )}
                    
                    <button 
                        onClick={onStart}
                        className="bg-[#6C48E3] hover:bg-[#5A3BC9] text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                        Start Practice
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PracticeCard;
