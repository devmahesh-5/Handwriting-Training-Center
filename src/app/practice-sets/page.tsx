'use client';
import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import PracticeSetCard from '@/components/PracticeSetCard';
import Loading from '@/components/Loading';
import { PracticeSet, userData } from '@/interfaces/interfaces';
import Input from '@/components/Input';

const PracticeSets = () => {
    const router = useRouter();
    const [practiceSets, setPracticeSets] = useState<PracticeSet[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [loadingForm, setLoadingForm] = useState(false);
    const [errorForm, setErrorForm] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const fetchSets = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get('/api/practice-set');
                setPracticeSets(response?.data?.practiceSets);
            } catch (error: unknown) {
                error instanceof AxiosError ? setError(error?.response?.data?.message) : setError("Something went wrong while fetching classrooms");
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        if (userData?.role !== 'Admin') return router.push('/home');
        fetchSets();
    }, []);

    const createNewSet = async () => {
        try {
            setLoadingForm(true);
            setErrorForm(null);
            const response = await axios.post('/api/practice-set', { title, description });
            if(response){
                fetchSets();
            }
            // console.log(response);
            router.refresh();
        } catch (error: unknown) {
            error instanceof AxiosError ? setErrorForm(error?.response?.data?.message) : setErrorForm("Something went wrong while fetching classrooms");
        } finally {
            setIsFormOpen(false);
            setLoadingForm(false);
        }
    };

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
            {<div className="flex justify-space-between gap-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isFormOpen ? "Create a new practice set" : "Practice sets"}</h1>
                {
                    isFormOpen && (
                        <div className="flex flex-row gap-4 bg-white dark:bg-gray-800 p-4 text-gray-900 dark:text-white justify-center items-center">
                            <Input
                                type="text"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2"
                            />
                            <textarea
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                className="w-full p-3 rounded-lg border border-gray-200 bg-[#F2F4F7] text-black placeholder-gray-400 
             focus:bg-white focus:ring-2 focus:ring-[#6C48E3] focus:outline-none 
             dark:bg-gray-600 dark:text-[#F2F4F7] dark:focus:bg-gray-700 transition-colors duration-200"
                            />
                        </div>
                    )

                }
                {
                    loadingForm? (<p className="text-gray-900 dark:text-white">Loading...</p>) : errorForm && (<p className="text-red-500">{errorForm}</p>)
                }
                <button
                    onClick={() => {
                        if (isFormOpen) {
                            createNewSet();
                        }
                        setIsFormOpen((prev) => !prev);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center cursor-pointer dark:hover:bg-[#F2F4F7] dark:hover:text-[#6C48E3] dark:bg-[#6C48E3] dark:text-white h-10 w-40 justify-center "
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create
                </button>



            </div>}

            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {practiceSets && (practiceSets?.map((set) => (
                    <div key={set._id}>
                        <PracticeSetCard
                            {...set}
                        />
                    </div>
                )))}
            </ul>
        </div>
    );

}

export default PracticeSets