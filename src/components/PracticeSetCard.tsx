'use client'
import React from 'react';
import Link from 'next/link';

interface Props {
    _id?: string;
    title: string;
    description?: string;
    practiceEntry?: string[];
    createdAt?: Date;
    updatedAt?: Date;   
}

function PracticeSetCard(props: Props) {
    const { title, description, practiceEntry, createdAt, updatedAt, _id } = props;
    
    return (
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {title}
                    </h3>
                    
                    {/* Practice Entry Count Badge */}
                    {practiceEntry && (
                        <span className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            {practiceEntry.length} {practiceEntry.length === 1 ? 'Entry' : 'Entries'}
                        </span>
                    )}
                </div>

                {/* Description */}
                {description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {description}
                    </p>
                )}

                {/* Dates */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    {createdAt && (
                        <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
                    )}
                    {/* {updatedAt && createdAt?.getTime() !== updatedAt.getTime() && (
                        <span>Updated: {new Date(updatedAt).toLocaleDateString()}</span>
                    )} */}
                </div>

                {/* Action Button */}
                {_id && (
                    <div className="mt-6">
                        <Link
                            href={`/practice-sets/${_id}`}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md font-medium transition-colors duration-200 block"
                        >
                            View Practice Set
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PracticeSetCard;