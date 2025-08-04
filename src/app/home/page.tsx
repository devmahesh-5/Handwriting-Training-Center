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

interface Classroom{
    name: string;
    description: string;
    students: string[];
    teacher: string;
    course: string;
    payment: string;
    subscription: string;
    practiceSet: string[];
}
function DashboardPage() {
    const dispatch = useDispatch();
    const authStatus = useSelector((state: { auth: { status: boolean; userData: userData; } }) => state.auth.status);

    const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);

    const [loading, setLoading] = useState(false);

    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    const [userClassrooms, setUserClassrooms] = useState<Classroom | null>();
    const [userCourses, setUserCourses] = useState([]);
    const [Practice, setPractice] = useState([]);
  const fetchUserClassrooms = async () => {
    try {
      const response = await axios.get('/api/classrooms/get-my-classroom');
      return response?.data?.classroom?.[0];
      
    } catch (error:unknown) {
      console.error("Error fetching user classrooms:", error);
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || "An error occurred while fetching classrooms");
      }

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
  
  useEffect(()=>{
    const fetchUser = async () => {
      try {
        
        const user = await axios.get('/api/users/me');
        setUser(user.data.user);

        dispatch(login(user.data.user));

      } catch (error) {
        setUser(null);

        dispatch(logout());
      }finally{
        setLoading(false);
      }

    }
    fetchUser();

    return () => {}

  },[dispatch]);

  useEffect(()=>{
    ;(
      async()=>{
        if(authStatus){
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
    
  },[authStatus]);

  console.log("classrooms", userClassrooms);
  console.log("courses", userCourses);
  console.log("practices", Practice);

//remember to add course to classroom
    return (
        <main className="min-h-screen dark:bg-gray-900 bg-[#F2F4F7]">
            <Header />
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto w-full px-4 py-3 sm:w-11/12 mt-10 '>
                <ClassroomCard title={userClassrooms?.name || "Classroom 1"} xp={1000} duration='15 days' />

                <CourseCard title="Course 2" xp={150} duration='12 days' description="Learn HTML and CSS" thumbnail="https://example.com/course2-thumbnail.jpg" />

                <ProfileCard fullName={userData?.fullName} xp={100} profilePicture={userData?.profilePicture || '/profile.png'} />

                <section className='col-span-1 md:col-span-2 lg:col-span-2 flex flex-col gap-4'>
                    
                    <PracticeCard title="HTML Practice" difficulty="Beginner" tags={['HTML', 'CSS']} xpReward={50} onStart={() => { }} />

                        <PracticeCard title="HTML Practice" difficulty="Beginner" tags={['HTML', 'CSS']} xpReward={50} onStart={() => { }} />
                </section>
            </div>

        </main>
    )
}

export default DashboardPage
