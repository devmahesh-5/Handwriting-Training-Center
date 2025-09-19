'use client'
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import ClassroomCard from '@/components/ClassroomCard';
import ProfileCard from '@/components/ProfileCard';
import CourseCard from '@/components/CourseCard';
import PracticeCard from '@/components/PracticeCard';
import axios, { AxiosError } from 'axios';
import Loading from '@/components/Loading';
import { userData, User } from '@/interfaces/interfaces';
import { FiAnchor, FiAward, FiBook, FiPenTool, FiUser } from 'react-icons/fi';

interface Classroom {
  _id?: string;
  name: string;
  status: 'Active' | 'Approved' | 'Pending';
  description: string;
  students: string[];
  teacher: {
    fullName: string;
    profilePicture?: string;
  };
  course: {
    name: string;
    duration: string;
    thumbnail: string;
  };
  payment: string;
  subscription: string;
  practiceSet: string;
  totalXp: number;
}

interface Course {
  _id?: string;
  name: string;
  description: string;
  thumbnail: string;
  duration: string;
  price: number;
}

interface Practice {
  _id?: string;
  title: string;
  instruction: string;
  image?: string;
  duration?: string;
  difficulty?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  xp?: number;
}



function DashboardPage() {

  const authStatus = useSelector((state: { auth: { status: boolean; userData: userData; } }) => state.auth.status);

  const userData: userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);

  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState<userData | null>(null);
  const [error, setError] = useState(null);

  const [userClassrooms, setUserClassrooms] = useState<Classroom | null>();
  const [userCourses, setUserCourses] = useState<Course | null>();
  const [leaderBoard, setLeaderBoard] = useState<User[] | null>(null);
  
  const fetchUserClassrooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/classrooms/get-my-classroom');
      return response?.data?.classroom?.[0];

    } catch (error: unknown) {

      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || "An error occurred while fetching classrooms");
      }

    } finally {
      setLoading(false);
    }
  }

  const fetchUserCourses = async () => {
    try {
      const response = await axios.get('/api/courses/get-latest');
      return response?.data?.latestCourses[0];

    } catch (error: unknown) {
      console.error("Error fetching user courses:", error);
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || "An error occurred while fetching courses");
      }

    }
  }
  const fetchLeaderBoard = async () => {
    try {
      const response = await axios.get('/api/users/leaderboard');
      return response.data.leaderBoard
    } catch (error: unknown) {
      console.error("Error fetching LeaderBoard:", error);
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || "An error occurred while fetching LeaderBoard");
      }
    }
  }

  useEffect(() => {
    ; (
      async () => {
        if (authStatus) {
          const [userClassrooms, userCourses, leaderBoard] = await Promise.all([
            fetchUserClassrooms(),
            fetchUserCourses(),
            fetchLeaderBoard()
          ])
          setUserClassrooms(userClassrooms);
          setUserCourses(userCourses);
          setLeaderBoard(leaderBoard)

        }
      }
    )();

  }, [authStatus]);

  //remember to add course to classroom
  return !loading ? (
    <main className="min-h-screen dark:bg-gray-800 bg-[#F2F4F7] loading-lazy">
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto w-full px-4 py-3 sm:w-11/12'>

        <ProfileCard
          fullName={userData?.fullName || "N/A"}
          profilePicture={userData?.profilePicture || "/profile.png"}
          email={userData?.email || "N/A"}
          gender={userData?.gender || "N/A"}
          username={userData?.username || "N/A"}
          phone={userData?.phone || "N/A"}
          role={userData?.role || "N/A"}
          isVerified={userData?.isVerified || false}
          memberSince={userData?.createdAt?.slice(0, 7) || "2025"} // Default if not provided
          totalClassAttended={userData?.totalClassAttended || 0}
          xps={userData?.xps || 0}
          skills={userData?.skills || []}
        />


        <CourseCard
          _id={userCourses?._id}
          title={userCourses?.name || "N/A"}
          duration={userCourses?.duration}
          description={userCourses?.description || "N/A"}
          thumbnail={userCourses?.thumbnail || '/course.png'}
          isNew={true}
        />
        <div className='flex flex-col row-span-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden'>
         <h2 className='text-2xl font-semibold mb-4 bg-gray-100 dark:bg-gray-800 p-3'>Leaderboard</h2>
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
              {userData?.role === 'Student'?(<div className="flex items-center space-x-2">
                <p className="font-medium text-gray-900 dark:text-white">{student?.xps || 0}</p>
                <FiAward className="w-5 h-5 text-green-600" />
              </div>):(
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900 dark:text-white">{student?.totalClassAttended || 0}</p>
                  <FiBook className="w-5 h-5 text-green-600" />
                </div>
              )}
            </div>
          ))
        }

        </div>

        <ClassroomCard
          id={userClassrooms?._id}
          title={userClassrooms?.name || "Unknown Classroom"}
          status={userClassrooms?.status || "Pending"}
          xp={userClassrooms?.totalXp || 100}
          duration={userClassrooms?.course?.duration || "N/A"}
          description={userClassrooms?.description || "N/A"}
          course={userClassrooms?.course || { name: "N/A", duration: "N/A", thumbnail: "/course.png" }}
          teacher={userClassrooms?.teacher || { fullName: "N/A", profilePicture: "/profile.png" }}
        />



        {/* <section className='col-span-1 md:col-span-2 lg:col-span-2 flex flex-col gap-4'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Practice Sets : Learn By Doing</h2>
          {
            Practice?.map((practice, index) => (
              <PracticeCard
                key={index}
                title={practice.title}
                _id={practice._id}
                instruction={practice?.instruction || "No description available"}
                difficulty={practice.difficulty}
                tags={practice.tags}
                xpReward={practice.xp}
              />
            ))
          }
        </section> */}
      </div>

    </main>
  ) : (
    <Loading message={"Loading Dashboard ..."} />
  )
}

export default DashboardPage
