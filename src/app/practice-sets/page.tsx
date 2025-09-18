'use client';
import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import PracticeSetCard from '@/components/PracticeSetCard';
import Loading from '@/components/Loading';
import { PracticeSet, userData } from '@/interfaces/interfaces';

const PracticeSets = () =>{
    const router = useRouter();
    const [practiceSets, setPracticeSets] = useState<PracticeSet[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);
    useEffect(() => {
        if(userData?.role !== 'Admin') return router.push('/home');
        const fetchSets = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get('/api/practice-set');
                setPracticeSets(response?.data?.practiceSets);
                console.log(response);
            } catch (error: unknown) {
                error instanceof AxiosError ? setError(error?.response?.data?.message) : setError("Something went wrong while fetching classrooms");
            } finally {
                setLoading(false);
            }
        };
        fetchSets();
    }, []);

    const createNewSet = () => router.push('/practice-sets/new');

    if (loading) {
        return <Loading message={"Loading practice sets..."} />;
    }

    if (error) {
        return (
            <div className="text-red-500 bg-[#F2F4F7] dark:bg-gray-800 p-4 min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Error: {error}</h1>
            </div>
        )
    }

    return (
        <div className="bg-[#F2F4F7] dark:bg-gray-800 p-4 min-h-screen">
            <div className="flex justify-space-between gap-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Practice Sets</h1>
                    <button
                        onClick={createNewSet}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center cursor-pointer"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create new Practice Set
                    </button>

                </div>

            <ul>
                {practiceSets?.map((set) => (
                    <div key = {set._id}>
                        <PracticeSetCard 
                        {...set} 
                        />
                    </div>
                ))}
            </ul>
        </div>
    );

}

export default PracticeSets