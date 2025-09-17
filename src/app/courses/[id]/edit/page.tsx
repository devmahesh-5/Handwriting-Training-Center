// name, description, type, price, duration, tags

'use client'
import React, { useEffect, useState } from 'react'
import CourseForm from '@/components/forms/CourseForm';
import axios, { AxiosError } from 'axios';
import Loading from '@/components/Loading';

const EditCourse = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = React.use(params);
    const [loading, setLoading] = useState<boolean>(false);
    const [course, setCourse] = useState<Course | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/api/courses/${id}`);
                setCourse(response?.data?.course[0]);
            } catch (error: unknown) {
                error instanceof AxiosError ? setError(error?.response?.data?.message) : setError("Something went wrong while fetching classrooms");
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id])


    return !loading && course ? (
        <div className='flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-800'>
            <CourseForm
                name={course.name}
                description={course.description}
                type={course.type}
                price={course.price}
                duration={course.duration}
                tags={course.tags}
                oldThumbnail={course.thumbnail}
                _id={course._id}
            />
        </div>
    ) : (
        <Loading message={"Fetching course details..."} />
    )


}

export default EditCourse;