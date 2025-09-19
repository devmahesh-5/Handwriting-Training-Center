'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { FiUsers, FiBook, FiHome, FiDollarSign, FiTrendingUp, FiAward, FiCalendar, FiUser } from 'react-icons/fi';
import { Dashboard } from '@/interfaces/interfaces';
import Loading from '@/components/Loading';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const AdminDashboard = () => {
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<Dashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/users/admin/dashboard');
                setDashboardData(response.data.dashboard);
            } catch (err: unknown) {
                if (err instanceof AxiosError) {
                    setError(err.response?.data.message);
                } else {
                    setError('Something went wrong');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Loading message="Loading dashboard..." />
        );
    }

    if (error || !dashboardData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <div className="text-center">
                    <div className="text-red-600 mb-4">{error || 'No data available'}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 "
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const {
        students = [],
        teachers = [],
        classrooms = [],
        courses = [],
        subscriptions = [],
        recentStudents = [],
        recentTeachers = [],
        topCourses = [],
        courseEarning = [],
        leaderBoard = [],
        teachersWithClassrooms = []
    } = dashboardData;


    // Calculate weekly stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyStudents = students.filter(student =>
        new Date(student.createdAt) >= oneWeekAgo
    ).length;

    const weeklyTeachers = teachers.filter(teacher =>
        new Date(teacher.createdAt) >= oneWeekAgo
    ).length;

    const totalEarnings = courseEarning[0]?.totalEarning || 0;
    //   const subscribedCount = subscriptions[0]?.count || 0;

    return (
        <div className="min-h-screen bg-[#F2F4F7] p-6 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hey, Admin </h1>
                    <p className="text-gray-600 mt-2 dark:text-gray-400">Welcome to your administration panel</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 cursor-pointer">
                    {/* Total Students */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-400">{students.length}</p>
                                <p className="text-sm text-green-600 mt-1">+{weeklyStudents} this week</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FiUsers className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Total Teachers */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Teachers</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-400">{teachers.length}</p>
                                <p className="text-sm text-green-600 mt-1">+{weeklyTeachers} this week</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FiAward className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Total Classrooms */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Classrooms</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-400">{classrooms.length}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{courses.length} courses</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <FiHome className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    {/* Total Earnings */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-400">Rs. {totalEarnings.toLocaleString()}</p>

                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <FiDollarSign className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    {subscriptions && subscriptions.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Link href="/subscriptions" className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Subscription Overview
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {subscriptions.reduce((total, sub) => total + sub.count, 0)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Total Subscriptions
                                    </p>
                                </div>
                                <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <FiBook className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                                </div>
                            </Link>

                            {/* Subscription Breakdown */}
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    By Status:
                                </p>
                                <div className="space-y-2">
                                    {subscriptions.map((subscription) => (
                                        <div key={subscription._id} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-300 capitalize">
                                                {subscription._id || 'Unknown'}
                                            </span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {subscription.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl p-6 space-y-4 col-span-3">
                        {/* Create Course Button */}
                        <button
                            onClick={() => router.push('/courses/add')}
                            className="w-full flex items-center justify-center space-x-3 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600 py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg cursor-pointer"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Create New Course</span>
                        </button>

                        {/* Create Practice Button */}
                        <button
                            onClick={() => router.push('/practices/create')}
                            className="w-full flex items-center justify-center space-x-3 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600 py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg cursor-pointer"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Create New Practice</span>
                        </button>

                        {/* Create Practice Entry Button */}
                        <button
                            onClick={() => router.push('/practice-entries/create')}
                            className="w-full flex items-center justify-center space-x-3 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600 py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg cursor-pointer"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Create Practice Entry</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Students */}
                    <div className="lg:col-span-2 dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Students</h2>
                            <FiCalendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            {recentStudents?.map((student) => (
                                <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer hover:bg-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            {student?.profilePicture ? (<img src={student.profilePicture} alt={student.fullName} className="w-10 h-10 rounded-full" />) : (<FiUsers className="w-5 h-5 text-blue-600" />)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{student.fullName}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(student.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Courses */}
                    <div className="dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 dark:text-white">Top Courses</h2>
                        <div className="space-y-4">
                            {topCourses.slice(0, 4).map((course, index) => (
                                <Link href={`/courses/${course._id}`} key={course._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer hover:bg-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                                            {index + 1}
                                        </div>
                                        <p className="font-medium text-gray-900 dark:text-white">{course.name}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <p className="font-medium text-gray-900 dark:text-white">{course?.enrolled || 0}</p>
                                        <FiTrendingUp className="w-5 h-5 text-green-600" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Teachers */}
                    <div className="dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 dark:text-white">Recent Teachers</h2>
                        <div className="space-y-4">
                            {recentTeachers.map((teacher) => (
                                <div key={teacher._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer hover:bg-gray-200">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center ">
                                        {teacher?.profilePicture ? (<img src={teacher.profilePicture} alt={teacher.fullName} className="w-10 h-10 rounded-full" />) : (<FiAward className="w-5 h-5 text-green-600" />)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{teacher.fullName}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{teacher.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Teachers with Classrooms */}
                    <div className="lg:col-span-2 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 dark:text-white">Top Teachers</h2>
                        <div className="space-y-4">
                            {teachersWithClassrooms?.map((teacher) => (
                                <div key={teacher._id} className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer hover:bg-gray-200">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            {teacher?.profilePicture ? (<img src={teacher.profilePicture} alt={teacher.fullName} className="w-12 h-12 rounded-full" />) : (<FiAward className="w-6 h-6 text-green-600" />)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{teacher.fullName}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{teacher.email}</p>
                                        </div>
                                    </div>
                                    <div className="pl-15">
                                        <p className="text-sm text-gray-600 mb-2 dark:text-gray-400">
                                            Classrooms: {teacher.classrooms?.length || 0}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Joined: {new Date(teacher.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
                </div>

                {/* Leader Board */}

                <div className="rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 mt-6 w-1/2">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 dark:text-white">Leader Board</h2>
                    <div className="space-y-4">
                        {
                            leaderBoard && leaderBoard.length > 0 && leaderBoard.map((student, index) => (
                                <div key={student._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer hover:bg-gray-200">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        {student?.profilePicture ? (<img src={student.profilePicture} alt={student.fullName} className="w-10 h-10 rounded-full" />) : (<FiUser className="w-5 h-5 text-green-600" />)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{student.fullName}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>

                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <p className="font-medium text-gray-900 dark:text-white">{student?.xps || 0}</p>
                                        <FiAward className="w-5 h-5 text-green-600" />
                                    </div>
                                </div>
                            ))
                        }

                    </div>
                </div>




                {/* Quick Stats Footer */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center hover:bg-gray-100 dark:hover:bg-gray-700">
                        <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center hover:bg-gray-100 dark:hover:bg-gray-700">
                        <p className="text-2xl font-bold text-green-600">{teachers.length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Teachers</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center hover:bg-gray-100 dark:hover:bg-gray-700">
                        <p className="text-2xl font-bold text-purple-600">{classrooms.length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Classrooms</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center hover:bg-gray-100 dark:hover:bg-gray-700">
                        <p className="text-2xl font-bold text-yellow-600">{courses.length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Courses</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;