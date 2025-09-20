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

interface submissionData {
  submissionFile?: FileList | null;
}

const PracticePage = ({ params }: { params: Promise<{ practiceEntryId: string, classroomId: string }> }) => {

  const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);

  const { register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<submissionData>(
    { mode: 'onBlur' }
  );

  const submissionFile = useWatch({ control, name: 'submissionFile' });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [practiceEntry, setPracticeEntry] = useState<PracticeEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'instructions' | 'reference' | 'video'>('instructions');

  const [activeSolutionTab, setActiveSolutionTab] = useState<number>(0);

  const [practiceSolutions, setPracticeSolutions] = useState<PracticeSolution[] | null>(null);

  const { classroomId, practiceEntryId } = React.use(params);

  const [solutionLoading, setSolutionLoading] = useState(false);


  const fetchSolutions = async (practiceId?: string) => {
    try {
      setError(null);

      setSolutionLoading(true);
      const response = await axios.get(`/api/practice-solution/students/${classroomId}?practiceId=${practiceId}`);
      setPracticeSolutions(response?.data?.solutions);
      
    } catch (error: unknown) {
      error instanceof AxiosError
        ? setError(error?.response?.data?.message)
        : setError("Something went wrong while fetching solutions");
    }finally{
      setSolutionLoading(false);
    }
  }

  const fetchMySolution = async (practiceId?: string) => {
    try {
      setError(null);
      setSolutionLoading(true);
      const response = await axios.get(`/api/practice-solution/my-solution/${classroomId}/${practiceId}`);
      const mySolution = response?.data?.solutions;

      if (mySolution) {
        setPracticeSolutions(mySolution);
      }

    } catch (error: unknown) {
      error instanceof AxiosError
        ? setError(error?.response?.data?.message)
        : setError("Something went wrong while fetching solutions");
    }finally{
      setSolutionLoading(false);
    }
  }

  const fetchPracticeEntry = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/practice-entry/get/${practiceEntryId}`);
        const practiceEntryData = response?.data?.practiceEntry[0];
        setPracticeEntry(practiceEntryData);

        // Get the practice ID from the response data directly
        const practiceId = practiceEntryData?.practice?._id;
        setPracticeId(practiceId);
        if (practiceId && userData?.role) {
          if (userData?.role === 'Teacher') {
            await fetchSolutions(practiceId);
          } else if (userData?.role === 'Student') {
            await fetchMySolution(practiceId);
          }
        } else {
          setError("User role or practice ID is missing");
        }
      } catch (error: unknown) {
        error instanceof AxiosError
          ? setError(error?.response?.data?.message)
          : setError("Something went wrong while fetching practice");
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    if (practiceEntryId) {
      fetchPracticeEntry();
    }
  }, [practiceEntryId]);


  // Preview
  useEffect(() => {
    // Create preview when file is selected
    if (submissionFile && submissionFile.length > 0) {
      const file = submissionFile[0];
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Clean up
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [submissionFile]);

  const submit = async (data: submissionData) => {
    try {
      setLoading(true);
      setError(null);
      const submissionData = new FormData();

      if (data?.submissionFile && data.submissionFile?.length > 0) {
        submissionData.append('submissionFile', data.submissionFile[0]);
      } else {
        setError("Please upload a submission file");
        return;
      }

      const response = await axios.post(`/api/practice-solution/submit/${classroomId}/${practiceEntry?.practice?._id}`, submissionData);

      if (response) {
        await fetchMySolution(practiceEntry?.practice?._id);
      }
      // router.push('/practices');

    } catch (error: unknown) {
      error instanceof AxiosError
        ? setError(error?.response?.data?.message)
        : setError("Something went wrong while submitting practice");
    } finally {
      setLoading(false);
    }
  };

  return !loading?(
    <div className="min-h-screen bg-[#F2F4F7] py-8 dark:bg-gray-900 dark:text-gray-200">

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-[#F2F4F7] rounded-lg shadow-md p-6 mb-6 dark:bg-gray-800 dark:text-[#F2F4F7]">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-[#F2F4F7]">{practiceEntry?.title || "Practice Entry"}</h1>
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
              onClick={() => router.push(`/my-classroom/${classroomId}`)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 dark:text-[#F2F4F7] dark:hover:text-[#F2F4F7] dark:hover:bg-gray-700"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-1  lg:grid-cols-3 gap-6`}>
          {/* Left Column - Practice Materials */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Practice Solutions  */}
            <div className="bg-[#F2F4F7] rounded-lg shadow-md p-6 dark:bg-gray-800 w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-[#F2F4F7]">Submission</h3>
            { !solutionLoading && ( <div className="p-4 rounded-lg text-center">
                {practiceSolutions && practiceSolutions.length > 0 ? (
  <div className="space-y-6">
    {/* Tabs for each submission */}
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {practiceSolutions.map((solution, index) => (
          <button
            key={solution._id}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeSolutionTab === index
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-[#F2F4F7]'
            }`}
            onClick={() => setActiveSolutionTab(index)}
          >
            {solution.student?.fullName}
          </button>
        ))}
      </nav>
    </div>

    {/* Submission content */}
    {practiceSolutions.map((solution, index) => (
      <div key={solution._id}>
      <Evaluation
        index={index}
        activeSolutionTab={activeSolutionTab}
        student={solution.student as User}
        status={solution.status}
        practice={solution.practice as Practice}
        submissionFile={solution.submissionFile}
        feedback={solution.feedback}
        marks={solution.marks}
        totalMarks={practiceEntry?.totalMarks || 0}
        _id={solution._id}
        role={userData?.role}
      />
      </div>
    ))}
  </div>
) : (
  <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-[#F2F4F7]">
      No Submissions Yet
    </h3>
    <p className="text-gray-700 dark:text-[#F2F4F7]">
      No practice solutions have been submitted yet.
    </p>
  </div>
)}
              </div>)}
            </div>
          </div>

          {/* Right Column - Submission Form */}
                {
                  userData?.role === 'Student' && !error ? (<div className="space-y-6">
                  <div className="bg-[#F2F4F7] rounded-lg shadow-md p-6 dark:bg-gray-800">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-[#F2F4F7]">Submit Your Practice</h3>

                    {/* //watch out here */}

                    <form onSubmit={handleSubmit(submit)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-[#F2F4F7]">
                          Upload your work
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            {previewUrl ? (
                              <div className="relative">
                                <img src={previewUrl} alt="Preview" className="mx-auto h-48 w-auto" />
                                <button
                                  type="button"

                                  onClick={() => {
                                    // Clear the preview URL and the file input
                                    reset();
                                    setPreviewUrl(null);
                                  }}
                                  className="absolute -top-2 -right-2 text-[#F2F4F7] hover:text-gray-700 bg-red-600 rounded p-1.5 shadow-md pointer-cursor"
                                > Remove </button>
                              </div>

                            ) : (
                              <>
                                <div className="flex text-sm text-gray-600 dark:text-gray-300">
                                  <label className="relative cursor-pointer bg-[#F2F4F7] dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500">
                                    <span>Upload an image</span>
                                    <input
                                      type="file"
                                      className="sr-only"
                                      {...register("submissionFile", { required: true })}
                                      accept="image/jpeg,image/png"
                                    />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  PNG, JPG, GIF up to 10MB
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        {loading && (
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Uploading...</p>
                        )}
                      </div>

                      {/* <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2 dark:text-[#F2F4F7]">
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    placeholder="Any comments about your practice..."
                    {...register('notes')}
                  />
                </div> */}

                      {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                      )}

                      <button
                        type="submit"
                        disabled={loading || !submissionFile || submissionFile.length === 0}
                        className="w-full flex justify-center pointer-cursor py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
                      >
                        {loading ? 'Submitting...' : 'Submit Practice'}
                      </button>
                    </form>
                  </div>

                  {/* Progress & Rewards */}
                  <div className="bg-[#F2F4F7] dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-[#F2F4F7]">Rewards</h3>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-full">
                        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-[#F2F4F7]">Earn {practiceEntry?.totalMarks} XP</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Complete this practice to earn experience points</p>
                      </div>
                    </div>
                  </div>
                </div>):userData?.role === 'Student' && error && (
                  <div className="flex items-center justify-center">
                  <span className="ml-2 text-red-600 dark:text-red-400">{error}</span>
                </div>
                )
                }
              </div>
            </div>
          </div>
          ):(
            <Loading message="Loading..." />
          )
};

          export default PracticePage;