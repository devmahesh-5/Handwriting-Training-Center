// name, instruction, type, price, duration, tags

'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import axios, { AxiosError } from 'axios';

import Input from '@/components/Input';
import Loading from '@/components/Loading';
import Select from '../Select';


interface Practice {
    title: string;
    instruction: string;
    xp: number;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    video?: FileList | null;
    image?: FileList | null;
    tags: string[];
}

interface Props {
    title?: string | null
    instruction?: string | null
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | null
    xp?: number | null
    oldImage?: string | null
    oldVideo?: string | null
    tags?: string[] | null
    _id?: string | null
}

const PracticeForm = (
    props: Props
) => {
    const { title, instruction, difficulty, xp, oldImage, oldVideo, tags, _id } = props

    const router = useRouter();

    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<Practice>({

        defaultValues: {
            title: title || '',
            instruction: instruction || '',
            difficulty: difficulty || 'Beginner',
            xp: xp || 0,
            tags: tags || []
        },
        mode: "onBlur"
    }
    );

    const image = useWatch({ control, name: 'image' });
    const video = useWatch({ control, name: 'video' });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewUrlVideo, setPreviewUrlVideo] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (image && image.length > 0) {
            const file = image[0];
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }

    }, [image]);

    useEffect(() => {
        if (video && video.length > 0) {
            const file = video[0];
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrlVideo(objectUrl);
        }

    }, [video]);


    const onSubmit = async (data: Practice) => {
        try {
            setLoading(true);
            setError(null);
            const formData = new FormData();

            if (data?.image && data.image?.length > 0) {
                formData.append('image', data.image[0]);
            }

            if (data?.video && data.video?.length > 0) {
                formData.append('video', data.video[0]);
            }

            (Object.keys(data) as (keyof Practice)[]).forEach((key) => {
                // Skip image as it's already appended above
                if (key === 'image' || key === 'video') return;
                // For tags (array), join as comma-separated string
                if (key === 'tags' && Array.isArray(data[key])) {
                    formData.append(key, (data[key] as string[]).join(','));
                } else {
                    formData.append(key, String(data[key]));
                }
            });

            let response;

            if (_id) {
                response = await axios.patch(`/api/practices/${_id}`, formData);
            } else {
                response = await axios.post('/api/practices/create', formData);
            }
            router.push(`/practices/view/${response?.data?.practice?._id}`);

        } catch (error: unknown) {
            error instanceof AxiosError ? setError(error?.response?.data?.message) : setError("Something went wrong while creating practice");
        } finally {
            setLoading(false);
        }
    };

    return !loading ? (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {_id ? 'Update Practice' : 'Create New Practice'}
                    </h1>
                </div>
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
                        <svg className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-800 dark:text-red-200">{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Name */}
                        <div className="md:col-span-2">
                            <Input
                                label="Practice Name"
                                {...register('title')}
                            />
                        </div>

                        {/* instruction */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Practice Instruction
                            </label>
                            <textarea
                                {...register("instruction")}
                                rows={5}
                                className="w-full p-3 rounded-lg border border-gray-200 bg-[#F2F4F7] text-black placeholder-gray-400 
             focus:bg-white focus:ring-2 focus:ring-[#6C48E3] focus:outline-none 
             dark:bg-gray-600 dark:text-[#F2F4F7] dark:focus:bg-gray-700 transition-colors duration-200"
                            />

                        </div>

                        <div>
                            <Select
                                label="difficulty"
                                options={['Beginner', 'Intermediate', 'Advanced']}
                                {...register('difficulty')}
                            />
                        </div>

                        <div>
                            <Input
                                label="Xp"
                                type="number"
                                {...register('xp')}
                            />
                        </div>

                        <div>
                            <Input
                                label="Tags"
                                {...register('tags')}

                                placeholder="Comma-separated tags"
                            />
                        </div>

                        {/* image Upload */}
                        {previewUrl ? (
                            <div className="relative">
                                <img src={previewUrl} alt="Preview" className="mx-auto h-48 w-auto" />
                                <button
                                    type="button"

                                    onClick={() => {
                                        // Clear the preview URL and the file input
                                        setValue('image', null);
                                        setPreviewUrl(null);
                                    }}
                                    className="absolute -top-2 -right-2 text-[#F2F4F7] hover:text-gray-700 bg-red-600 rounded p-1.5 shadow-md pointer-cursor"
                                > Remove </button>
                            </div>

                        ) : (<div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Practice image
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            PNG, JPG, GIF up to 10MB
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        {...register('image')}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </label>
                            </div>
                            {errors.image && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.image.message}</p>
                            )}
                        </div>)}

                        {
                            oldImage && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Current image
                                    </label>
                                    <img src={oldImage} alt="Preview" className="mx-auto h-48 w-auto" />
                                </div>
                            )
                        }

                        {previewUrlVideo ? (
                            <div className="relative">
                                <video src={previewUrlVideo} controls className="mx-auto h-48 w-auto" />
                                <button
                                    type="button"

                                    onClick={() => {
                                        // Clear the preview URL and the file input
                                        setValue('video', null);
                                        setPreviewUrl(null);
                                    }}
                                    className="absolute -top-2 -right-2 text-[#F2F4F7] hover:text-gray-700 bg-red-600 rounded p-1.5 shadow-md pointer-cursor"
                                > Remove </button>
                            </div>

                        ) : (<div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Practice Video
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Click to upload</span>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">

                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        {...register('video')}
                                        className="hidden"
                                        accept="video/*"
                                    />
                                </label>
                            </div>
                            {errors.video && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.video.message}</p>
                            )}
                        </div>)}

                        {
                            oldVideo && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Current Video
                                    </label>
                                    <video src={oldVideo} controls className="mx-auto h-48 w-auto" />
                                </div>
                            )
                        }
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Launching Practice...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>Launch Practice</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>


            </div>
        </div>
    ) : (
        <Loading message={'Launching Practice...'} />
    )


}

export default PracticeForm;