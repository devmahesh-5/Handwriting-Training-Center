'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import Image from 'next/image';
import Loading from '@/components/Loading';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Practice, userData } from '@/interfaces/interfaces';

const ViewPractice = ({ params }: { params: Promise<{ id: string }> }) => {
    const [practice, setPractice] = useState<Practice | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { id } = React.use(params);
    const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);
    const router = useRouter();

    useEffect(() => {
        const fetchPractice = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/api/practices/${id}`);
                console.log(response);
                setPractice(response?.data?.practice);
            } catch (error: unknown) {
                error instanceof AxiosError ? setError(error?.response?.data?.message) : setError("Something went wrong while fetching practice");
            } finally {
                setLoading(false);
            }
        };
        fetchPractice();
    }, [id]);

    if (loading) {
        return <Loading message="Fetching practice" />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="text-red-600 mb-4">{error}</div>
                    <button
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!practice) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="text-gray-600 mb-4">Practice not found</div>
                    <button
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header with Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Practices
                    </button>
                    
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {practice.title}
                    </h1>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            practice.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            practice.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                            {practice.difficulty}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {practice.xp} XP
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Image and Instructions */}
                    <div className="space-y-6">
                        {/* Practice Image */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                            <div className="relative aspect-video">
                                <Image
                                    src={practice.image}
                                    alt={practice.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Instructions
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {practice.instruction}
                            </p>
                        </div>

                        {/* Tags */}
                        {practice.tags && practice.tags.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {practice.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Video and Details */}
                    <div className="space-y-6">
                        {/* Video Player */}
                        {practice.video && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                                <div className="aspect-video">
                                    <video
                                        controls
                                        className="w-full h-full object-cover"
                                        poster={practice.image}
                                    >
                                        <source src={practice.video} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
                        )}

                        {/* Practice Details */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Practice Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{practice.difficulty}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Experience Points:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{practice.xp} XP</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {new Date(practice.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {new Date(practice.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* <button
                                    onClick={() => router.push(`/practice/attempt/${practice._id}`)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Attempt Practice
                                </button> */}
                                
                                {userData?.role === 'Admin' && (
                                    <button
                                        onClick={() => router.push(`/practices/edit/${practice._id}`)}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Practice
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewPractice;