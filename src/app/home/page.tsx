'use client'
import React, { useState, useEffect } from 'react'
import Header from "@/components/Header";
import { useSelector, useDispatch } from 'react-redux';
import ClassroomCard from '@/components/ClassroomCard';
import ProfileCard from '@/components/ProfileCard';
import CourseCard from '@/components/CourseCard';
import PracticeCard from '@/components/PracticeCard';
import axios, { AxiosError } from 'axios';
import { login, logout } from '@/store/authSlice';

interface Classroom {
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
interface userData {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  profilePicture: string | null;
  phone: string;
  isVerified: boolean;
  role: string;
  gender: string;
  created_at?: string;
}


function DashboardPage() {
  const dispatch = useDispatch();
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
      console.error("Error fetching user classrooms:", error);
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
    const fetchUser = async () => {
      try {
        setLoading(true);
        const user = await axios.get('/api/users/me');
        setUser(user.data.user);

        dispatch(login(user.data.user));

      } catch (error) {
        setUser(null);

        dispatch(logout());
      } finally {
        setLoading(false);
      }

    }
    fetchUser();

    return () => { }

  }, [dispatch]);

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
      <Header />
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto w-full px-4 py-3 sm:w-11/12 mt-10 '>
        <ClassroomCard

          title={userClassrooms?.name || "Unknown Classroom"}
          currentXp={userClassrooms?.totalXp || 10}
          status={userClassrooms?.status || "locked"}
          xp={userClassrooms?.totalXp || 100}
          duration={userClassrooms?.course?.duration || "Not mentioned"}
          description={userClassrooms?.description || "Not mentioned"}
          course={userClassrooms?.course || { name: "Not mentioned", duration: "Not mentioned", thumbnail: "/course.png" }}
          teacher={userClassrooms?.teacher || { fullName: "Not mentioned", profilePicture: "/profile.png" }}
        />

        <CourseCard
          _id={userCourses?._id}
          title={userCourses?.name || "Course 1"}
          duration={userCourses?.duration}
          description={userCourses?.description || "Not mentioned"}
          thumbnail={userCourses?.thumbnail || '/course.png'} />

        <ProfileCard

          fullName={user?.fullName || "Unknown User"}
          profilePicture={user?.profilePicture || "/profile.png"}
          email={user?.email || "Not mentioned"}
          gender={user?.gender || "Not mentioned"}
          username={user?.username || "Unknown User"}
          phone={user?.phone || "Not mentioned"}
          role={user?.role || "Not mentioned"}
          isVerified={user?.isVerified || false}
          memberSince={user?.created_at || "2025"} // Default if not provided

        />

        <section className='col-span-1 md:col-span-2 lg:col-span-2 flex flex-col gap-4'>

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
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500 dark:text-gray-300">Loading...</p>
    </div>
  )
}

export default DashboardPage
