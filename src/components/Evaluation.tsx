'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import axios, { AxiosError } from 'axios';
import {User, Practice} from '@/interfaces/interfaces';

interface props {
    _id: string;
    student : User;
    status : string;
    practice : Practice;
    submissionFile : string;
    feedback ?: string | null;
    marks ?: number | 0;
    totalMarks : number;
    index : number;
    activeSolutionTab : number;
    role : string;
}
const Submission = ({
    _id,
    student,
    status,
    practice,
    submissionFile,
    feedback: initialFeedback = '',
    marks: initialMarks = 0,
    totalMarks,
    index,
    activeSolutionTab,
    role
    
}
:props)=>{
    const [feedback, setFeedback] = useState<string>('');
    const [marks, setMarks] = useState<number | 0>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const submitEvaluation = async() => {
        try {
            setLoading(true);
            setError(null);

            await axios.patch(`/api/practice-solution/${_id}`, {
                feedback,
                marks,
            });
            
        } catch (error: unknown) {
            (error instanceof AxiosError )? setError(error.response?.data.message) : setError("An unexpected error occurred");
        }finally{
            setLoading(false);
        }
    }

    return (
        <div
                key={_id}
                className={`bg-[#F2F4F7] dark:bg-gray-800 dark:text-[#F2F4F7] rounded-xl shadow-md overflow-hidden ${
                  activeSolutionTab !== index ? 'hidden' : ''
                }`}
              >
                <div className="p-6">
                  {/* Student info header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        {student?.profilePicture ? (
                          <Image
                            src={student.profilePicture}
                            alt={student?.fullName}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <span className="text-indigo-800 font-medium">
                            {student?.fullName?.charAt(0) || 'S'}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-[#F2F4F7]">
                          {student?.fullName}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Submission Status:
                          <span
                            className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {status}
                          </span>
                        </p>
                      </div>
                    </div>
        
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Practice</p>
                      <p className="text-md font-medium text-gray-900 dark:text-[#F2F4F7]">
                        {practice.title}
                      </p>
                    </div>
                  </div>
        
                  <div className="flex flex-col">
                    {/* Student submission */}
                    <div>
                      {/* <h3 className="text-md font-medium text-gray-900 mb-2 bg-gray-100 p-2 rounded dark:bg-gray-700">
                        Student Submission
                      </h3> */}
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                        <Image
                          src={submissionFile}
                          alt="Student submission"
                          width={400}
                          height={300}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="mt-2 flex items-center">
                        <span className="text-sm text-gray-600">Difficulty:</span>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {practice.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                 {
                  !loading ?(<div className="mt-6">
          {/* Evaluation Header */}
          <h3 className="text-md font-semibold text-gray-800 mb-3 p-2 border-b border-gray-200 dark:border-gray-700 dark:text-[#F2F4F7]">
            Evaluation
          </h3>
          
          {(initialFeedback || role === 'Student') ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Feedback Card */}
                <div className="flex-1 bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 dark:text-[#F2F4F7]">Instructor Feedback</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {initialFeedback || "No feedback provided yet."}
                  </p>
                </div>
                
                {/* Marks Card */}
                <div className="bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 dark:text-[#F2F4F7]">Score</h4>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {initialMarks || 0}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mx-1">/</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {totalMarks || 100}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            status === 'pending' && role === 'Teacher' && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#F2F4F7]" htmlFor="feedback">
                      Provide Feedback
                    </label>
                    <textarea
                      id="feedback"
                      name="feedback"
                      rows={3}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="block w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                      placeholder="Share constructive feedback for the student..."
                    />
                    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <label className="text-sm font-medium text-gray-700 mr-2 dark:text-[#F2F4F7]">
                        Marks:
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={totalMarks || 100}
                        value={marks}
                        onChange={(e) => setMarks(Number(e.target.value))}
                        className="w-16 p-1 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <span className="text-sm text-gray-500 ml-1 dark:text-gray-400">
                        / {totalMarks || 100}
                      </span>
                    </div>
                    
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => {
                        e.preventDefault();
                        submitEvaluation();
                      }}
                      disabled={loading || !feedback || marks < 0 || marks > (totalMarks || 100)}
                      aria-disabled={loading || !feedback || marks < 0 || marks > (totalMarks || 100)}
                    >
                      Submit Evaluation
                    </button>
                  </div>
                </form>
              </div>
            )
          )}
        </div>):(
                    <div className="flex items-center justify-center mt-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-300">Evaluating...</span>
                  </div>
        )}
                </div>
        
              </div>
    )

}

export default Submission;
