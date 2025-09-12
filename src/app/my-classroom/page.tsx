"use client";
import React, { useState, useEffect } from 'react'
import Header from "@/components/Header";
import { useSelector, useDispatch } from 'react-redux';
import ClassroomCard from '@/components/ClassroomCard';
import ProfileCard from '@/components/ProfileCard';
import axios, { AxiosError } from 'axios';
import { ApiError } from '@/utils/ApiError';

interface Classroom {
  _id?: string;
  name: string;
  status: 'active' | 'completed' | 'locked';
  description: string;
  students: string[];
  teacher: {
    fullName: string;
    profilePicture?: string;
  };
  course: {
    name: string;
    duration: string;
    thumbnail: string;
  };
  payment: string;
  subscription: string;
  practiceSet: string;
  totalXp: number;
}


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

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classrooms?.map((classroom: Classroom) => (
                        <ClassroomCard
                            key={classroom._id}
                            id={classroom._id}
                            title={classroom.name || "Unknown Classroom"}
                            currentXp={classroom?.totalXp || 10}
                            status={classroom?.status || "locked"}
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
    )


}

export default MyClassrooms;