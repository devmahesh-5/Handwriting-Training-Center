'use client'
import React from 'react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { MdCall, MdMessage } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import PracticeEntryCard from '@/components/PracticeEntryCard';
import Loading from '@/components/Loading';
import { Classroom, userData, User,PracticeEntry } from '@/interfaces/interfaces';
import TeacherCard from '@/components/TeacherCard';

const ClassroomPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const Router = useRouter();
    const [teachers, setTeachers] = useState<User[]>([]);
    const [isTeacherActive, setIsTeacherActive] = useState(false);
    const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);
    const router = useRouter();
    const { id } = React.use(params);

    const date = new Date().getHours();

    useEffect(() => {
        ; (
            async () => {
                try {

                    setLoading(true);
                    const response = await axios.get(`/api/classrooms/${id}`);
                    //console.log("Classroom Response:", response.data);

                    setClassroom(response.data.classroom[0]);
                    setLoading(false);
                } catch (error: unknown) {
                    if (error instanceof AxiosError) {
                        setError(error.response?.data?.message || 'An error occurred while fetching classroom data.');
                    }
                } finally {
                    setLoading(false);
                }
            }
        )();


    }, []);

    const startWhiteboard = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`/api/whiteboard/create`, {
                classroomId: classroom?._id,
                name: `${classroom?.name} -Whiteboard`,
                owner: userData?._id
            });

            Router.push(`/my-classroom/whiteboard/${classroom?._id}/${response.data.whiteboard._id}`);

        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data?.message || 'An error occurred while fetching classroom data.');
            }
        } finally {
            setLoading(false);
        }

    }

    const getTeacher = async () =>{
        try {
            setLoading(true);
            setError(null);
            setIsTeacherActive(true);
            const response = await axios.get(`/api/users/teachers`);
            setTeachers(response.data.teachers);
            setLoading(false);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data?.message || 'An error occurred while fetching classroom data.');
            }
        } finally {
            setLoading(false);
        }
    }

    const handleTeacherActive = ()=>{
        setIsTeacherActive(!isTeacherActive);
        router.refresh();
    }


    return !loading ? (
        <div className="px-4 md:px-8 lg:px-12 py-8 min-h-screen bg-gray-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
                <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg px-4 py-2 cursor-pointer">
                    {
                        date < 12 ? '🌞 Good Morning' : date < 18 ? '🌞 Good Afternoon' : '🌞 Good Evening'
                    }
                    {
                        userData?.fullName ? `, ${userData.fullName.split(' ')[0]}` : ''
                    }
                </div>
                <div className="flex items-center space-x-4 mr-4">
                    <button>
                        <MdMessage className="text-2xl text-[#6c30d0] w-8 h-8 cursor-pointer" />

                    </button>

                    {classroom?.status === 'Active' &&
                        (
                            <button onClick={startWhiteboard}>
                                <MdCall className="text-2xl text-[#6c30d0] w-8 h-8 cursor-pointer" />
                            </button>
                        )
                    }
                </div>

            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {classroom?.name || "My Classroom"}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {classroom?.description || "Description"}
                            </p>

                            <div className="flex items-center space-x-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${classroom?.status === 'Active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    {classroom?.status}
                                </span>

                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <span className="mr-2">🌟</span>
                                    <span>Total XP: {classroom?.totalXp || 0}</span>
                                </div>
                            </div>
                        </div>

                        {classroom?.teacher ? (
                            <div className="flex items-center space-x-3">
                                {classroom?.teacher.profilePicture ? (
                                    <img
                                        src={classroom?.teacher.profilePicture}
                                        alt={classroom?.teacher.fullName}
                                        className="rounded-full w-12 h-12 object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-gray-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                        {classroom.teacher.fullName.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Teacher</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {classroom.teacher.fullName}
                                    </p>
                                </div>
                            </div>
                        ):(!classroom?.teacher && userData?.role === 'Admin') ?(
                            <button 
                            onClick={getTeacher}
                            className="px-6 py-3 border border-blue-600 rounded-xl hover:bg-[#082845] hover:text-white dark:hover:bg-gray-800 dark:text-white cursor-pointer">
                            Assign Teacher
                            </button>
                        ):(
                            <div className='flex items-center space-x-3'>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Teacher will be assigned soon</p>
                                </div>
                        )
                    }
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Practice Set */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Practice Set: {classroom?.course?.practiceSet?.title}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                {classroom?.course?.practiceSet?.description}
                            </p>
                        </div>

                        {classroom?.course?.practiceSet?.practiceEntries?.map((entry: PracticeEntry) => (
                            <PracticeEntryCard
                                classroomId={classroom._id}
                                key={entry._id}
                                _id={entry._id}
                                status={entry.status}
                                day={entry.day}
                                practice={entry.practice}
                            />
                        ))}
                    </div>
                </div>
                {
                    userData?.role === 'Admin' && isTeacherActive && (
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Select one teacher
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {
                                            teachers?.map((teacher: User) => (
                                                <TeacherCard
                                                    key={teacher._id}
                                                    teacher={teacher}
                                                    classroomId={classroom?._id}
                                                    handleTeacherActive={handleTeacherActive}
                                                />
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                    )
                }

                {/* Right Column - Students and Course Info */}
                <div className="space-y-6">
                    {/* Course Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Course Information
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {classroom?.createdAt && (<div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(classroom.createdAt).toLocaleDateString()}
                                    </p>
                                </div>)}
                                {classroom?.updatedAt && (<div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(classroom.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>)}
                                {classroom?.practiceSet && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Practice Sets</p>
                                        <p className="text-gray-900 dark:text-white">
                                            {classroom?.course?.practiceSet.practiceEntries?.length || 0} exercises
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Students List */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Students ({classroom?.students?.length || 0})
                                </h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {classroom?.students?.map((student) => (
                                    <div key={student._id} className="flex items-center space-x-3">
                                        {student.profilePicture ? (
                                            <Image
                                                src={student.profilePicture}
                                                alt={student.fullName}
                                                width={40}
                                                height={40}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-gray-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                {student.fullName.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {student.fullName}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                @{student.username}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {Array.isArray(classroom?.students) && classroom?.students.length > 3 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        +{classroom?.students.length - 3} more students
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <Loading message="Loading classroom..." />
    );

};

export default ClassroomPage;