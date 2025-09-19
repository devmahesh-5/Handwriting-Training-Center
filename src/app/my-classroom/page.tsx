"use client";
import React, { useState, useEffect } from 'react'
import ClassroomCard from '@/components/ClassroomCard';
import axios, { AxiosError } from 'axios';
import Loading from '@/components/Loading';
import { Classroom } from '@/interfaces/interfaces';


const MyClassrooms = () => {
    const [classrooms, setClassrooms] = useState<Classroom[] | null>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(()=>{

        ; (
        async () => {
            
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get('/api/classrooms/get-my-classroom');
                setClassrooms(response?.data?.classroom);
                
                
            } catch (error: unknown) {
                error instanceof AxiosError ? setError(error?.response?.data?.message) : setError("Something went wrong while fetching classrooms");
            } finally {
                setLoading(false);
            }
        }


    )();
    },[]);

    return !loading?(
        <div className="min-h-screen bg-[#F2F4F7] dark:bg-gray-800 text-gray-900 dark:text-white">
            
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classrooms?.map((classroom: Classroom) => (
                        
                        <ClassroomCard
                            key={classroom._id}
                            id={classroom._id}
                            title={classroom.name || "Unknown Classroom"}
                            status={classroom?.status || "Pending"}
                            xp={classroom?.totalXp || 100}
                            duration={classroom?.course?.duration || "N/A"}
                            description={classroom?.description || "N/A"}
                            course={classroom?.course || { name: "N/A", duration: "N/A", thumbnail: "/course.png" }}
                            teacher={classroom?.teacher || { fullName: "N/A", profilePicture: "/profile.png" }}
                        />
                    ))}
                </div>
            </main>
        </div>
    ):(
        <Loading message={"Fetching classrooms"} />
    )


}

export default MyClassrooms;