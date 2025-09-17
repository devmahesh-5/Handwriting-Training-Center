'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import Loading from '@/components/Loading';
import { useSelector } from 'react-redux';
import { useForm, useWatch } from 'react-hook-form';
import {useRouter} from 'next/navigation';

interface submissionData {
  paymentProof?: FileList | null;
}

interface PracticeSet {
  _id: string;
  title: string;
  description: string;
  practiceEntry: string[]; // Array of practice entry IDs
}

interface Course {
  _id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  duration: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  practiceset: PracticeSet[];
}

export default function CourseDetailPage() {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<submissionData>({ mode: 'onBlur' });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const paymentProof = useWatch({ control, name: 'paymentProof' });
  const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [practiceSets, setPracticeSets] = useState<PracticeSet[] | null>(null);
  const [loadingPracticeset, setLoadingPracticeset] = useState<boolean>(false);
  const [errorPracticeset, setErrorPracticeset] = useState<string | null>(null);
  const [isPracticeSetActive, setIsPracticeSetActive] = useState(false);

  useEffect(() => {
    // Create preview when file is selected
    if (paymentProof && paymentProof.length > 0) {
      const file = paymentProof[0];
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Clean up
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [paymentProof]);


  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`/api/courses/${courseId}`);
        setCourse(response.data.course[0]);
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          setError(error.response?.data.message);
        } else {
          setError('Something went wrong');
        }

      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }

  }, [courseId]);

  const subscribe = async(data: submissionData) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
  
      if (data?.paymentProof && data.paymentProof?.length > 0) {
        formData.append('paymentProof', data.paymentProof[0]);
      }
      const response = await axios.post(`/api/subscriptions/book/${courseId}`, formData);
      setSuccess(true);
    } catch (error: unknown) {
      console.error("Signup error:", error);
      setError(error instanceof AxiosError ? error.response?.data?.message : "Upload failed. Please try again.");
    } finally {
      setLoading(false);
      
    }

    

  }

  const getPracticeSet =async()=>{
    try {
      setLoadingPracticeset(true);
      setError(null);
      setIsPracticeSetActive(true);
      const practiceSets = await axios.get(`/api/practice-set`);
      setPracticeSets(practiceSets.data.practiceSets);
      
    } catch (error: unknown) {
      setErrorPracticeset(error instanceof AxiosError ? error.response?.data?.message : "something went wrong While adding practice set.");
    } finally {
      setLoadingPracticeset(false);
      
    }

  }

  const addPracticeSet = async(practiceSetId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.patch(`/api/courses/${courseId}/${practiceSetId}`);
      setIsPracticeSetActive(false);
    } catch (error: unknown) {
      console.error("Signup error:", error);
      setError(error instanceof AxiosError ? error.response?.data?.message : "Upload failed. Please try again.");
    } finally {
      setLoading(false);
      
    }
  }

  const router = useRouter();

  if (loading) {
    return (
      <Loading message="Loading course details..." />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Link href="/courses" className="text-blue-600 hover:underline dark:text-white">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <div className="text-gray-600 mb-4 dark:text-gray-300">Course not found</div>
          <Link href="/courses" className="text-blue-600 hover:underline dark:text-white">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link href="/courses" className="text-blue-600 hover:underline">
            ← Back to Courses
          </Link>
        </nav>

        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 dark:bg-gray-800">
          <div className="relative h-64 w-full">
            <Image
              src={course.thumbnail}
              alt={course.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">
                  {course.name}
                </h1>
                <p className="text-gray-600 mb-4 dark:text-gray-300">{course.description}</p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 ">
                  Rs. {course.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{course.duration}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100  text-blue-800 text-sm font-medium rounded">
                {course.type}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">
                {course.practiceset.length} Practice Sets
              </span>
            </div>

            {userData.role === "student" ?(<button
              onClick={() => setOpenPayment(prev => !prev)}
              className="bg-[#6C48E3] hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors cursor-pointer">
              Enroll Now
            </button>):userData.role === 'Admin' &&(
              <button
              onClick={()=>router.push(`/courses/${courseId}/edit`)}
              className="bg-[#6C48E3] hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors cursor-pointer">
              Edit
            </button>
            )}

            {
              (openPayment && !success) ? (
                <div className="mt-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
                    Payment for {course.name}
                  </h1>
                  <div className="mt-4">
                    <form onSubmit={handleSubmit(subscribe)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-[#F2F4F7]">
                          Upload Payment Proof
                        </label>
                        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 rounded-md border ${!previewUrl? "border-2 border-dashed border-gray-300 dark:border-gray-600" : ""}`}>
                          <div className={`space-y-1 text-center`}>
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
                                    <span>Upload Payment Proof Image</span>
                                    <input
                                      type="file"
                                      className="sr-only"
                                      {...register("paymentProof", { required: true })}
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

                      {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                      )}

                      <button
                        type="submit"
                        disabled={loading || !paymentProof || paymentProof.length === 0}
                        className="w-full flex justify-center pointer-cursor py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
                      >
                        {paymentLoading ? 'Subscribing...' : 'Subscribe'}
                      </button>
                    </form>
                  </div>

                </div>
              ):success && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
                    Payment for {course.name} is uploaded.We will assign you a tutor soon.
                  </h1>
                  </div>
              )
            }
            {
              error && (
                <div className="text-red-500 text-sm">{error}</div>
              )
            }
          </div>
        </div>

        {/* Practice Sets Section */}
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">Practice Sets</h2>
          <button
              onClick={getPracticeSet}
              className="bg-[#6C48E3] hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors cursor-pointer">
              Add Practice Set
            </button>
            </div>

            {isPracticeSetActive &&(
              loadingPracticeset? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-300">
                  <p>Loading practice sets...</p>
                </div>
              ):errorPracticeset?(
                <div className="text-center py-8 text-gray-500 dark:text-gray-300">
                  <p className='text-red-500'>{errorPracticeset}</p>
                </div>
              ):(
                Array.isArray(practiceSets) && practiceSets.length > 0 ? (
                  practiceSets.map((practiceSet) => (
                    <div
                      key={practiceSet._id}
                      className="flex border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-grow">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
                        {practiceSet.title}
                      </h3>
                      <p className="text-gray-600 mb-3 dark:text-gray-300">{practiceSet.description}</p>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {practiceSet.practiceEntry.length} practice entries
                        </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => addPracticeSet(practiceSet._id)}
                          className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 bg-transparent border border-red-500 hover:border-red-600 dark:border-red-400 dark:hover:border-red-500 px-4 py-2 rounded-md transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-300">
                    <p>No practice sets available for this course yet.</p>
                  </div>
                )

              ))
            }

          {course.practiceset.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-300">
              <p>No practice sets available for this course yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {course.practiceset.map((practiceSet) => (
                <div
                  key={practiceSet._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
                    {practiceSet.title}
                  </h3>
                  <p className="text-gray-600 mb-3 dark:text-gray-300">{practiceSet.description}</p>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {practiceSet.practiceEntry.length} practice entries
                    </span>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Course Metadata */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
          <div>
            <strong>Course ID:</strong> {course._id}
          </div>
          <div>
            <strong>Created:</strong> {new Date(course.createdAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Last Updated:</strong> {new Date(course.updatedAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Total Practice Entries:</strong>{' '}
            {course.practiceset.reduce((total, set) => total + set.practiceEntry.length, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}