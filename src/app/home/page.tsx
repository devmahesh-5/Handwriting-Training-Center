'use client'
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import ClassroomCard from '@/components/ClassroomCard';
import ProfileCard from '@/components/ProfileCard';
import CourseCard from '@/components/CourseCard';
import PracticeCard from '@/components/PracticeCard';
import axios, { AxiosError } from 'axios';
import Loading from '@/components/Loading';

interface Classroom {
  _id?: string;
  name: string;
  status: 'active' | 'completed' | 'locked';
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
  const [Practice, setPractice] = useState<Practice[] | null>();
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

  const fetchPractice = async () => {
    try {
      const response = await axios.get('/api/practices');
      return response.data.practices;

    } catch (error: unknown) {
      console.error("Error fetching practices:", error);
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || "An error occurred while fetching practices");
      }

    }
  }

  useEffect(() => {
    ; (
      async () => {
        if (authStatus) {
          const [userClassrooms, userCourses, Practice] = await Promise.all([
            fetchUserClassrooms(),
            fetchUserCourses(),
            fetchPractice()
          ])
          setUserClassrooms(userClassrooms);
          setUserCourses(userCourses);
          setPractice(Practice);
        }
      }
    )();

  }, [authStatus]);

  //remember to add course to classroom
  return !loading ? (
    <main className="min-h-screen dark:bg-gray-900 bg-[#F2F4F7] loading-lazy">
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto w-full px-4 py-3 sm:w-11/12'>
        <ClassroomCard
          id={userClassrooms?._id}
          title={userClassrooms?.name || "Unknown Classroom"}
          currentXp={userClassrooms?.totalXp || 10}
          status={userClassrooms?.status || "locked"}
          xp={userClassrooms?.totalXp || 100}
          duration={userClassrooms?.course?.duration || "N/A"}
          description={userClassrooms?.description || "N/A"}
          course={userClassrooms?.course || { name: "N/A", duration: "N/A", thumbnail: "/course.png" }}
          teacher={userClassrooms?.teacher || { fullName: "N/A", profilePicture: "/profile.png" }}
        />

        <CourseCard
          _id={userCourses?._id}
          title={userCourses?.name || "N/A"}
          duration={userCourses?.duration}
          description={userCourses?.description || "N/A"}
          thumbnail={userCourses?.thumbnail || '/course.png'} />

        <ProfileCard

          fullName={userData?.fullName || "N/A"}
          profilePicture={userData?.profilePicture || "/profile.png"}
          email={userData?.email || "N/A"}
          gender={userData?.gender || "N/A"}
          username={userData?.username || "N/A"}
          phone={userData?.phone || "N/A"}
          role={userData?.role || "N/A"}
          isVerified={userData?.isVerified || false}
          memberSince={userData?.created_at || "2025"} // Default if not provided

        />

        <section className='col-span-1 md:col-span-2 lg:col-span-2 flex flex-col gap-4'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Practice Sets : Learn By Doing</h2>
          {
            Practice?.map((practice, index) => (
              <PracticeCard
                key={index}
                title={practice.title}
                _id={practice._id}
                description={practice?.instruction || "No description available"}
                difficulty={practice.difficulty}
                tags={practice.tags}
                xpReward={practice.xp}
                onStart={() => console.log(`Starting practice: ${practice.title}`)}
              />
            ))
          }
        </section>
      </div>

    </main>
  ) : (
    <Loading message={"Loading Dashboard ..."}/>
  )
}

export default DashboardPage
