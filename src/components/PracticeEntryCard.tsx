'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Practice, userData } from '@/interfaces/interfaces';
import { useSelector } from 'react-redux';
import axios, { AxiosError } from 'axios';

interface Props {
    classroomId?: string;
    _id?: string;
    status: string;
    day: number;
    practice?: Practice;
    title?: string;
    practiceSetId?: string;
    isInSet?: boolean | false;
    refresh ?: () => void
}

function PracticeEntryCard(props: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { classroomId, _id, status, day, practice, practiceSetId, isInSet, refresh,title } = props;
    const router = useRouter();
    const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);

    const addToPracticeSet = async () => {
        try {
            setError(null);
            setLoading(true);
            const response = await axios.post(`/api/practice-set/add/${practiceSetId}/${_id}`);

            if (response) {
                if (refresh) refresh();
            }
        } catch (error: unknown) {
            error instanceof AxiosError ? setError(error?.response?.data?.message) : setError("Something went wrong while fetching classrooms");
        } finally {
            setLoading(false);
        }
    }

    const RemoveFromPracticeSet = async () => {
        try {
            setError(null);
            setLoading(true);
            const response = await axios.patch(`/api/practice-set/add/${practiceSetId}/${_id}`);

            if (response) {
                if (refresh) refresh();
            }
        } catch (error: unknown) {
            error instanceof AxiosError ? setError(error?.response?.data?.message) : setError("Something went wrong while fetching classrooms");
        } finally {
            setLoading(false);
        }
    }

    if(loading){
        return <div className='text-center text-gray-500 dark:text-gray-400'>{isInSet ? 'Removing...' : 'Adding...'}</div>
    }

    return (
        <div
            key={_id}
            className={`p-4 border-b rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-50 cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-900 transition-colors ${status === 'locked' ? 'opacity-70' : ''
                }`}
        >
            {error && <div className="text-red-500">{error}</div>}
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
                        Day {day}: {title}
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
                <div className="flex items-center">
                    {(userData?.role === 'Student' || userData?.role === 'Teacher') && (
                        <button
                        className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer mt-4"
                        onClick={() => { router.push(`/practices/${classroomId}/${_id}`) }}
                    >
                        {/* {status === 'locked' ? 'Locked' : 'Solve Now'} */}
                        {userData?.role === 'Teacher' ? 'View' : 'Solve Now'}
                    </button>)}
                    {
                        userData?.role === 'Admin' && practiceSetId && (
                            <button
                                className={`px-4 py-2 rounded-md text-sm font-medium ${isInSet ? 'bg-red-600 hover:bg-red-800 text-white' : 'bg-green-600 hover:bg-green-800'} text-white cursor-pointer mt-4`}
                                onClick={() => {
                                    if (isInSet) {
                                        RemoveFromPracticeSet();
                                    } else {
                                        addToPracticeSet();
                                    }
                                }}
                            >
                                {isInSet ? 'Remove' : 'Add'}
                            </button>
                        )
                    }

                    {
                        userData?.role === 'Admin' && (!practiceSetId) && (
                            <button
                                className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white mt-4 cursor-pointer"
                                onClick={() => {
                                    router.push(`/practice-entries/${_id}`);
                                }}
                            >
                                View
                            </button>
                        )
                    }
                </div>
            </div>
        </div>
    )
}
export default PracticeEntryCard;