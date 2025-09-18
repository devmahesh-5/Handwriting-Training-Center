// name, description, type, price, duration, tags

'use client'
import React, { useEffect, useState } from 'react'
import PracticeForm from '@/components/forms/PracticeForm';
import axios, { AxiosError } from 'axios';
import Loading from '@/components/Loading';
import { Practice } from '@/interfaces/interfaces';

const EditPractice = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = React.use(params);
    const [loading, setLoading] = useState<boolean>(false);
    const [Practice, setPractice] = useState<Practice | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPractice = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/api/practices/${id}`);
                
                setPractice(response?.data?.practice);
            } catch (error: unknown) {
                error instanceof AxiosError ? setError(error?.response?.data?.message) : setError("Something went wrong while fetching classrooms");
            } finally {
                setLoading(false);
            }
        };
        fetchPractice();
    }, [id])


    return !loading && Practice ? (
        <div className='flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-800'>
            <PracticeForm
                title={Practice?.title}
                difficulty={Practice?.difficulty}
                xp={Practice?.xp}
                instruction={Practice?.instruction}
                tags={Practice.tags}
                oldImage={Practice.image}
                _id={Practice._id}
                oldVideo={Practice?.video}
            />
        </div>
    ) : loading?(
        <Loading message={"Fetching Practice details..."} />
    ):(
        <div className='flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-800'>
            <h1 className='text-2xl font-bold text-gray-800 dark:text-gray-200'>{error}</h1>
        </div>
    )


}

export default EditPractice;