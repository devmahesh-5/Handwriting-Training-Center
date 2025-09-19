"use client";

import React, { useState, useEffect, use } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Evaluation from '@/components/Evaluation';

import Loading from '@/components/Loading';

import { PracticeEntry, userData,PracticeSolution, Practice,User } from '@/interfaces/interfaces';


const PracticeEntryPage = ({ params }: { params: Promise<{id: string }> }) => {

  const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);

  const { register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm(
    { mode: 'onBlur' }
  );

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [practiceEntry, setPracticeEntry] = useState<PracticeEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'instructions' | 'reference' | 'video'>('instructions');

  const [activeSolutionTab, setActiveSolutionTab] = useState<number>(0);
  const { id } = React.use(params);


  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/practice-entry/get/${id}`);
        const practiceEntryData = response?.data?.practiceEntry[0];
        setPracticeEntry(practiceEntryData);

      } catch (error: unknown) {
        error instanceof AxiosError
          ? setError(error?.response?.data?.message)
          : setError("Something went wrong while fetching practice");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);


  return !loading?(
    <div className="min-h-screen bg-[#F2F4F7] py-8 dark:bg-gray-900 dark:text-gray-200">

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-[#F2F4F7] rounded-lg shadow-md p-6 mb-6 dark:bg-gray-800 dark:text-[#F2F4F7]">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-[#F2F4F7]">{practiceEntry?.title || 'No title' }</h1>
              <div className="flex items-center mt-2 space-x-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Day {practiceEntry?.day}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {practiceEntry?.practice?.difficulty}
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {practiceEntry?.totalMarks} XP
                </span>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 dark:text-[#F2F4F7] dark:hover:text-[#F2F4F7] dark:hover:bg-gray-700"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-6`}>
          <div className="space-y-6">
            {/* Tabs */}
            <div className="bg-[#F2F4F7] dark:bg-gray-800 rounded-lg shadow-md">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('instructions')}
                    className={`py-4 px-6 text-center font-medium text-sm border-b-2 ${activeTab === 'instructions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Instructions
                  </button>
                  <button
                    onClick={() => setActiveTab('reference')}
                    className={`py-4 px-6 text-center font-medium text-sm border-b-2 ${activeTab === 'reference'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Reference
                  </button>
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`py-4 px-6 text-center font-medium text-sm border-b-2 ${activeTab === 'video'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Video Guide
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'instructions' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-[#F2F4F7]">Instructions</h3>
                    <p className="text-gray-700 dark:text-[#F2F4F7]">{practiceEntry?.practice?.instruction}</p>
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 dark:text-[#F2F4F7]">Tags</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {practiceEntry?.practice?.tags?.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm dark:bg-gray-700 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reference' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-[#F2F4F7]">Reference Image</h3>
                    <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                      {practiceEntry?.practice?.image && (<Image
                        src={practiceEntry?.practice?.image }
                        alt="Practice reference"
                        fill
                        className="object-contain"
                      />)}
                    </div>
                  </div>
                )}

                {activeTab === 'video' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-[#F2F4F7]">Video Demonstration</h3>
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        src={practiceEntry?.practice?.video}
                        controls
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

              </div>
            </div>
          </div>
          ):(
            <Loading message="Loading..." />
          )
};

export default PracticeEntryPage;