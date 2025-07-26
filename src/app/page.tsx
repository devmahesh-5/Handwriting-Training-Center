// app/page.tsx
'use client'

import React, { useState, useEffect } from "react";
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import {login, logout} from '@/store/authSlice';
import Link from 'next/link'
import Logo from "@/components/LOGO";

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();
  const authStatus = useSelector((state: { auth: { status: boolean; userData: userData; }}) => state.auth.status);
  const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; })=>state.auth.userData);

  useEffect(()=>{
    const fetchUser = async () => {
      try {
        setLoading(true);
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




  return !loading?(
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Hero Section */}
      {authStatus &&(<header className="bg-white dark:bg-gray-900">
        <nav className="max-w-5xl mx-auto flex  items-center justify-between p-4">
          
          <div className="flex items-center">
            <Logo />
          </div>

          <div className="">
              <p className="text-3xl text-[#F2F4F7] dark:text-gray-200 font-mono font-bold"> Namaskar <span className="text-[#6C48E3] font-mono font-bold">{userData?.fullName}</span> </p>
              </div>

          <div className="flex items-center cursor-pointer">
            {userData?.profilePicture && userData?.profilePicture !== '' && userData?.profilePicture !== 'undefined' ? (
            <img
              src={userData.profilePicture}
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover cursor-pointer"
            />
          ) : (<svg
                    className="w-14 h-14 rounded-full object-cover text-gray-200 bg-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>)}
          </div>
        </nav>
      </header>)}
      <section className="flex flex-col items-center justify-center text-center py-24 px-4">

            
        <h1 className="text-4xl md:text-6xl">
          welcome to <span className="text-[#6C48E3] font-mono font-bold">Handwriting Training Center</span>
        </h1>
        <p className="mt-4 text-lg max-w-xl">
          Find the perfect tutor for you or your children&apos;s handwriting needs.
        </p>
        <div className="mt-6 flex gap-4">

          {
            !authStatus ?(<Link href="/auth/signup" className="px-6 py-3 border border-blue-600 rounded-xl hover:bg-blue-500 hover:text-white dark:hover:bg-gray-800">
            Join now
          </Link>):(
            <Link href="/users/me" className="px-6 py-3 border border-blue-600 rounded-xl hover:bg-blue-500 hover:text-white dark:hover:bg-gray-800">
            Dashboard
          </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h2 className="text-xl font-semibold">Verified Tutors</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Every tutor goes through a screening process.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Flexible Scheduling</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Subscribe for the Course and get access to the classroom and communcate with your tutor</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Affordable Pricing</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Go through course details and choose a plan that works for you</p>
          </div>
        </div>
      </section>

      {/* Optional Testimonials / Call to Action */}
      <section className="py-20 text-center">
        <h2 className="text-2xl font-bold">Thousands of students trust us to learn better</h2>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Join our growing community today.</p>
        <span className="text-gray-500 dark:text-gray-400 text-4xl font-bold"> Testimonials</span>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <img src="/testimonial1.png" alt="Testimonial 1" className="w-full h-auto" />
          <img src="/testimonial2.png" alt="Testimonial 2" className="w-full h-auto" />
          <img src="/testimonial3.png" alt="Testimonial 3" className="w-full h-auto" />
        </div>
      </section>
    </main>
  ):(
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <h1>loading...</h1>
      </main>
  )
}
