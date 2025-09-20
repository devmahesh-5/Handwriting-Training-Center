'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import SubscriptionCard from '@/components/SubscriptionCard';
import Loading from '@/components/Loading';
import { Course, User } from '@/interfaces/interfaces';

interface Subscription {
    _id: string,
    student: User,
    classroom?: [string] | null,
    paymentProof: string,
    status: string,
    course: Course,
    createdAt: Date,
    updatedAt: Date,
    __v: number
}

const MySubscription = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(()=>{
        const fetchSubscriptions = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get('/api/subscriptions/my-subscriptions');
                setSubscriptions(response.data.subscriptions);
            } catch (error) {
                if (error instanceof AxiosError) {
                    setError(error.response?.data?.message);
                    if (error.response?.status === 401) {
                        router.push('/auth/login');
                    }
                }else{
                    setError('Something went wrong while fetching subscriptions');
                }
            }finally{
                setLoading(false);
            }
        };
        fetchSubscriptions();


    },[]);

    if(!subscriptions){  return ( 
        <div className="flex flex-col items-center justify-center bg-gray-100 p-4 dark:bg-gray-800 min-h-screen w-full">
                <div className="flex flex-col items-center justify-center h-full w-full">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Subscriptions Found</h2>
                    <p className="text-gray-600 dark:text-gray-300">You don&apos;t have any subscriptions yet.</p>
                    <button
                    onClick={() => router.push('/courses')} 
                    className="mt-4 px-4 py-2 bg-[#082845] text-white rounded-md hover:bg-[#6C48E3]">Explore Courses</button>
                       
            </div>
        </div>
    )
    }


    return !loading && !error ? (
        <div className="flex flex-col gap-4 bg-gray-100 p-4 dark:bg-gray-800 min-h-screen w-full">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Subscriptions</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscriptions?.map((subscription) => (
                    console.log("class", subscription),
                    <div key={subscription._id}>
                        <SubscriptionCard 
                            _id={subscription._id}
                            course={subscription.course}
                            student={subscription.student}
                            paymentProof={subscription.paymentProof}
                            classroom={subscription?.classroom?.[0] || null}
                            status={subscription.status}
                            requestedAt={subscription.createdAt}
                            updatedAt={subscription.updatedAt}
                         />
                    </div>
                ))}
            </div>
        </div>
    ) : (
        <Loading message={"Fetching your subscriptions..."} />
    )

}

export default MySubscription
