
'use client'
import React, { useEffect, useState } from 'react'
import CourseCard from "@/components/CourseCard";
import axios, { AxiosError } from 'axios';
import { MdLaunch, MdSearch } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

import Loading from '@/components/Loading';
import { Course, userData } from '@/interfaces/interfaces';

const Courses = () => {
    const [query, setQuery] = useState<string>("");
    const [courses, setCourses] = useState<Course[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);

    const fetchCourses = async (query?: string) => {
        try {
            setLoading(true);
            setError(null);
            if (query?.length === 0) {
                const response = await axios.get('/api/courses/get-latest');
                setCourses(response?.data?.latestCourses);
            } else {
                const response = await axios.get(`/api/courses/search?query=${query}`);
                setCourses(response?.data?.courses);
            }
        } catch (error: unknown) {
            error instanceof AxiosError ? setError(error?.response?.data?.message) : setError("Something went wrong while fetching classrooms");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCourses(query);
        }, 1000);

        return () => clearTimeout(timer);
    }, [query]);

    const search = async () => {
        try {
            setError(null);
            setLoading(true);
            const response = await axios.get(`/api/courses/search?query=${query}`);
            setCourses(response?.data?.courses);
        } catch (error: unknown) {
            error instanceof AxiosError ? setError(error?.response?.data?.message) : setError("Something went wrong while fetching classrooms");
        } finally {
            setLoading(false);
        }
    };


    return !loading && !error ? (
        <div className="bg-gray-100 dark:bg-gray-800">
            <div className="flex gap-4 justify-space-between items-center w-full max-w-md py-2 px-4">
                <div className="flex w-full rounded-full shadow-sm border border-gray-300 overflow-hidden bg-[#F2F4F7] focus-within:ring-2 focus-within:ring-gray-500">
                    <input
                        type="text"
                        placeholder="Search for a course..."
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


                </div>
                {userData.role ==='Admin' &&(<button
                    onClick={() => router.push('/courses/add')}
                    className="flex items-center justify-center px-4 text-white bg-[#6c44ff] hover:bg-[#6c44ff]/80 transition-colors rounded-full"
                >
                    <MdLaunch size={20} />Launch Course
                </button>)}
            </div>

            {!loading && !error ? (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-100 p-4 dark:bg-gray-800 min-h-screen w-full">
                    {courses?.map((course: Course, index: number) => (
                        <div key={index}>
                            <CourseCard
                                _id={course?._id}
                                title={course?.name || "N/A"}
                                duration={course?.duration}
                                description={course?.description || "N/A"}
                                thumbnail={course?.thumbnail || '/course.png'}
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
    ):!error?(
        <Loading message={"Fetching Courses"} />
    ):(
        <div className="flex flex-col gap-4 bg-gray-100 p-4 dark:bg-gray-800 min-h-screen">
            <p className="text-red-500">{error}</p>
        </div>
    )
}

export default Courses