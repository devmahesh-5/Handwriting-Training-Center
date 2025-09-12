'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Props {
    classroomId?: string;
    _id?: string;
    status : string;
    day: number;
    practice?: Practice;
    title?: string;
}

function PracticeEntryCard(props: Props) {
    const {classroomId,_id, status, day, practice } = props;

    return (
        <Link href={status == 'locked' ? `/practices/${classroomId}/${_id}` : '#'} key={_id} passHref>
                            <div
                                key={_id}
                                className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${status === 'locked' ? 'opacity-70' : ''
                                    }`}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        {practice?.image && (
                                            <Image
                                                src={practice.image}
                                                alt={practice.title}
                                                width={80}
                                                height={80}
                                                className="rounded-lg"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            Day {day}: {practice?.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                            {practice?.instruction}
                                        </p>
                                        <div className="mt-2 flex items-center space-x-4">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                Difficulty: {practice?.difficulty}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                XP: {practice?.xp}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            className={`px-4 py-2 rounded-md text-sm font-medium ${status === 'locked'
                                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                }`}
                                            disabled={status === 'locked'}
                                        >
                                            {status === 'locked' ? 'Locked' : 'Solve Now'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            </Link>
    )
}
export default PracticeEntryCard;