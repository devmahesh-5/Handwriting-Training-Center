'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import PracticeEntryCard from '@/components/PracticeEntryCard';
import Loading from '@/components/Loading';
import { PracticeSet, userData, PracticeEntry } from '@/interfaces/interfaces';

const PracticeSetPage = ({params}:{params:Promise<{id:string}>}) => {
    const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
    const [practiceEntries, setPracticeEntries] = useState<PracticeEntry[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [practiceEntriesLoading, setPracticeEntriesLoading] = useState(true);
    const [practiceEntriesError, setPracticeEntriesError] = useState<string | null>(null);
    const [isPracticeEntryActive, setIsPracticeEntryActive] = useState(false);
    const router = useRouter();
    const { id } = React.use(params);
    const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);

    const fetchPracticeSet = async () =>{
        try {
            setError(null);
            setLoading(true);
            const response = await axios.get(`/api/practice-set/${id}`);
            setPracticeSet(response?.data?.practiceSet[0]);
            console.log(response);
        } catch (error: unknown) {
            error instanceof AxiosError ? setError(error?.response?.data?.message) : setError("Something went wrong while fetching classrooms");
        } finally {
            setLoading(false);
        }
    }

    const getPracticeEntries =async() =>{
        try {
            setPracticeEntriesError(null);
            setPracticeEntriesLoading(true);
            setIsPracticeEntryActive(true);
            const response = await axios.get(`/api/practice-entry`);
            setPracticeEntries(response?.data?.practiceEntries);
            
        } catch (error:unknown) {
            error instanceof AxiosError ? setPracticeEntriesError(error?.response?.data?.message) : setPracticeEntriesError("Something went wrong while fetching classrooms");
            
        }finally{
            setPracticeEntriesLoading(false);
        }
    }

    useEffect(() => {
        if(userData?.role !== 'Admin') return router.push('/home');
        fetchPracticeSet();
    }, [id]);

    if (loading) {
        return <Loading message={"Loading practice entries..."} />;
    }

    if(!practiceSet) return null;

   return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6 text-sm font-medium"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Practice Sets
                </button>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        {practiceSet?.title}
                    </h1>
                    
                    {practiceSet?.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                            {practiceSet.description}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {practiceSet?.practiceEntries?.length || 0} practice entries
                        </div>
                    </div>
                </div>
            </div>

            {/* Practice Entries Grid */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Practice Entries
                    </h2>
                    
                    {practiceSet?.practiceEntries?.length === 0 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            No entries yet
                        </span>
                    )}
                </div>

                {practiceSet?.practiceEntries && practiceSet.practiceEntries.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {practiceSet.practiceEntries.map((entry) => (
                            <PracticeEntryCard
                                key={entry._id}
                                _id={entry._id}
                                status={entry.status}
                                day={entry.day}
                                practice={entry.practice}
                                practiceSetId={id}
                                isInSet = {true}
                                refresh={fetchPracticeSet}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
                        <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No practice entries yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            This practice set doesn&apos;t contain any entries yet.
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={getPracticeEntries}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center cursor-pointer"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Entry
                    </button>

                    {/* <button
                        onClick={() => router.push(`/practice-set/${id}/edit`)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Practice Set
                    </button> */}
                </div>
                {isPracticeEntryActive && (<div className="mt-6">
                    {
                        practiceEntriesLoading ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Loading...
                            </div>) :!practiceEntriesError? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {practiceEntries?.filter((entry) => !practiceSet?.practiceEntry.includes(entry._id) ).map((entry) => (
                                    <PracticeEntryCard
                                        key={entry._id}
                                        _id={entry._id}
                                        status={entry.status}
                                        day={entry.day}
                                        practice={entry.practice}
                                        practiceSetId={id}
                                        isInSet = {false}
                                        refresh={fetchPracticeSet}
                                    />
                                ))}
                            </div>

                        ):(
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                            Error: {practiceEntriesError}
                            </div>
                        )
                    }
                    </div>)}
            </div>
        </div>
    </div>
);
};

export default PracticeSetPage;