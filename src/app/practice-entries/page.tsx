
'use client'
import React, { useEffect, useState } from 'react'
import PracticeEntryCard from "@/components/PracticeEntryCard";
import axios, { AxiosError } from 'axios';
import { MdLaunch, MdSearch } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

import Loading from '@/components/Loading';
import { PracticeEntry, userData } from '@/interfaces/interfaces';

const PracticeEntries = () => {
    const [query, setQuery] = useState<string>("");
    const [PracticeEntries, setPracticeEntries] = useState<PracticeEntry[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);

    const fetchPracticeEntryEntries = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/api/practice-entry');
            setPracticeEntries(response?.data?.practiceEntries);

        } catch (error: unknown) {
            error instanceof AxiosError ? setError(error?.response?.data?.message) : setError("Something went wrong while fetching classrooms");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPracticeEntryEntries();
    }, []);



    //search needs to be implimented later
    // const search = async () => {
    //     try {
    //         setError(null);
    //         setLoading(true);
    //         const response = await axios.get(`/api/PracticeEntryEntries/search?query=${query}`);
    //         setPracticeEntries(response?.data?.PracticeEntryEntries);
    //     } catch (error: unknown) {
    //         error instanceof AxiosError ? setError(error?.response?.data?.message) : setError("Something went wrong while fetching classrooms");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return !loading && !error ? (
        <div className="bg-gray-100 dark:bg-gray-800 dark:text-white min-h-screen">
            <div className="flex gap-4 justify-space-between items-center w-full max-w-md py-2 px-4">
                {/* <div className="flex w-full rounded-full shadow-sm border border-gray-300 overflow-hidden bg-[#F2F4F7] focus-within:ring-2 focus-within:ring-gray-500">
                    <input
                        type="text"
                        placeholder="Search for a PracticeEntry..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-grow px-4 py-2 text-sm text-gray-700 focus:outline-none"
                    />
                    <button
                        onClick={search}
                        className="flex items-center justify-center px-4 text-white bg-gray-500 hover:bg-gray-600 transition-colors"
                    >
                        <MdSearch size={20} />
                    </button>


                </div> */}
                {userData.role === 'Admin' && (<button
                    onClick={() => router.push('/practice-entries/create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center cursor-pointer dark:hover:bg-[#F2F4F7] dark:hover:text-[#6C48E3] dark:bg-[#6C48E3] dark:text-white h-10 justify-center "
                >
                    <MdLaunch size={20} />Create a new PracticeEntry
                </button>)}
            </div>

            {!loading && !error ? (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-100 p-4 dark:bg-gray-800 w-full">
                    {PracticeEntries?.map((PracticeEntry: PracticeEntry, index: number) => (
                        <div key={index}>
                            <PracticeEntryCard
                                _id={PracticeEntry?._id}
                                day={PracticeEntry?.day}
                                practice={PracticeEntry?.practice}
                                status={PracticeEntry?.status}
                                title={PracticeEntry?.title}
                            />
                        </div>
                    ))}
                </div>

            ) : loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 min-h-screen bg-gray-100 dark:bg-gray-800">
                    {Array(6)
                        .fill(0)
                        .map((_, idx) => (
                            <div
                                key={idx}
                                className="flex animate-pulse gap-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow"
                            >
                                {/* Thumbnail placeholder */}
                                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full"></div>

                                {/* Text placeholders */}
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                </div>

            ) : (
                <div className="flex flex-col gap-4 bg-gray-100 p-4 dark:bg-gray-800 min-h-screen">
                    <p className="text-red-500">{error}</p>
                </div>
            )}
        </div>
    ) : !error ? (
        <Loading message={"Fetching PracticeEntries..."} />
    ) : (
        <div className="flex flex-col gap-4 bg-gray-100 p-4 dark:bg-gray-800 min-h-screen">
            <p className="text-red-500">{error}</p>
        </div>
    )
}

export default PracticeEntries