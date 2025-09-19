'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { Practice } from '@/interfaces/interfaces';


const CreatePracticeEntry = () => {
    const [day, setDay] = useState<number>(1);
    const [title, setTitle] = useState<string>('');
    const [practiceId, setPracticeId] = useState<string>('');
    const [practices, setPractices] = useState<Practice[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Fetch available practices
    useEffect(() => {
        const fetchPractices = async () => {
            try {
                setError(null);
                setLoading(true);
                const response = await axios.get('/api/practices');
                setPractices(response.data.practices || []);
            } catch (error: unknown) {
                console.error('Failed to fetch practices:', error);
                setError(
                    error instanceof AxiosError
                        ? error.response?.data?.message || 'Failed to fetch practices'
                        : 'Failed to fetch practices'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPractices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`/api/practice-entry/${practiceId}`, {
                day: Number(day),
                title
            });

            if (response.status === 201 || response.status === 200) {
                router.push(`/practice-entries/${response?.data?.practiceEntry?._id}`);
            }
        } catch (error: unknown) {
            console.error('Failed to create practice entry:', error);
            setError(
                error instanceof AxiosError
                    ? error.response?.data?.message || 'Failed to create practice entry'
                    : 'Failed to create practice entry'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 shadow-md border border-gray-200 dark:border-gray-700 min-h-screen">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create New Practice Entry
            </h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Day Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Day Number
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={day}
                        onChange={(e) => setDay(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Practice Entry Title [make unique]
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                    />
                </div>

                {/* Practice Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Practice
                    </label>
                    <select
                        value={practiceId}
                        onChange={(e) => setPracticeId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                    >
                        <option value="">Select a practice</option>
                        {practices.map((practice) => (
                            <option key={practice._id} value={practice._id}>
                                {practice.title} - {practice.difficulty}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Practice Preview (if a practice is selected) */}
                {practiceId && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 mt-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Selected Practice Preview
                        </h4>

                        {practices.find(p => p._id === practiceId) ? (
                            <div className="space-y-4">
                                {/* Header with basic info */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h5 className="text-md font-medium text-gray-900 dark:text-white">
                                            {practices.find(p => p._id === practiceId)?.title}
                                        </h5>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${practices.find(p => p._id === practiceId)?.difficulty === 'Beginner'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    practices.find(p => p._id === practiceId)?.difficulty === 'Intermediate'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                {practices.find(p => p._id === practiceId)?.difficulty}
                                            </span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                                                {practices.find(p => p._id === practiceId)?.xp} XP
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Instruction */}
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {practices.find(p => p._id === practiceId)?.instruction}
                                    </p>
                                </div>

                                {/* Tags */}
                                {practices.find(p => p._id === practiceId)?.tags && (
                                    <div>
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-400">Tags: </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {practices.find(p => p._id === practiceId)?.tags?.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Media Preview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Image Preview */}
                                    {practices.find(p => p._id === practiceId)?.image && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-2">Reference Image</p>
                                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                                <img
                                                    src={practices.find(p => p._id === practiceId)?.image}
                                                    alt={practices.find(p => p._id === practiceId)?.title}
                                                    onClick={(e) => {
                                                        if (e.currentTarget.requestFullscreen) {
                                                            e.currentTarget.requestFullscreen();
                                                        }
                                                    }}
                                                    className="object-fit cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Video Preview */}
                                    {practices.find(p => p._id === practiceId)?.video && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-2">Instruction Video</p>
                                            <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                                <video
                                                    src={practices.find(p => p._id === practiceId)?.video}
                                                    controls
                                                    className="w-full h-full"
                                                    poster={practices.find(p => p._id === practiceId)?.image}
                                                >
                                                    Your browser does not support the video tag.
                                                </video>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Loading practice details...</p>
                            </div>
                        )}
                    </div>
                )}


                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    {/* <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md transition-colors"
            disabled={loading}
          >
            Cancel
          </button> */}
                    <button
                        type="submit"
                        disabled={loading || !practiceId}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </>
                        ) : (
                            'Create Entry'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePracticeEntry;