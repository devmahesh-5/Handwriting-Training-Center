
'use client'
import React, { useEffect, useState } from 'react'
import CourseCard from "@/components/CourseCard";
import axios, { AxiosError } from 'axios';
import Loading from "@/components/Loading";

const Courses = () => {

    const [courses, setCourses] = useState<Course[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get('/api/courses/get-latest');
                setCourses(response?.data?.latestCourses);
                console.log("courses", response);
            } catch (error: unknown) {
                error instanceof AxiosError ? setError(error?.response?.data?.message) : setError("Something went wrong while fetching classrooms");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();

    }, []);

console.log("courseaas", courses)

    return !loading && !error ? (

        <div className="flex flex-col gap-4 bg-gray-100 p-4 dark:bg-gray-800 min-h-screen w-full">
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
        <Loading message="Loading Courses..." />
    ): (
        <div className="flex flex-col gap-4 bg-gray-100 p-4 dark:bg-gray-800">
            <p className="text-red-500">{error}</p>
        </div>
    )
}

export default Courses