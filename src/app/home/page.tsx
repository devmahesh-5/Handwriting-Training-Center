'use client'
import React, { useState, useEffect } from 'react'
import Header from "@/components/Header";
import { useSelector, useDispatch } from 'react-redux';
import ClassroomCard from '@/components/ClassroomCard';
import ProfileCard from '@/components/ProfileCard';
import CourseCard from '@/components/CourseCard';
import PracticeCard from '@/components/PracticeCard';
import axios from 'axios';
import { login, logout } from '@/store/authSlice';

function DashboardPage() {
    const dispatch = useDispatch();
    const authStatus = useSelector((state: { auth: { status: boolean; userData: userData; } }) => state.auth.status);

    const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);

    const [loading, setLoading] = useState(false);

    const [user, setUser] = useState(null);

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


    return (
        <main className="min-h-screen dark:bg-gray-900 bg-[#F2F4F7]">
            <Header />
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto w-full px-4 py-3 sm:w-11/12 mt-10 '>
                <ClassroomCard title="Classroom 1" xp={200} duration='15 days' />

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
