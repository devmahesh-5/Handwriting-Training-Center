// app/page.tsx
'use client'

import React from "react";
import {useSelector} from 'react-redux';
import Link from 'next/link'


export default function LandingPage() {
  const authStatus = useSelector((state: { auth: { status: boolean; userData: userData; }}) => state.auth.status);


  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

      
      <section className="flex flex-col items-center justify-center text-center py-24 px-4">

            
        <h1 className="text-4xl md:text-6xl">
          welcome to <span className="text-[#6C48E3] font-mono font-bold">Handwriting Training Center</span>
        </h1>
        <p className="mt-4 text-lg max-w-xl">
          Find the perfect tutor for you or your children&apos;s handwriting needs.
        </p>
        <div className="mt-6 flex gap-4">

          {
            !authStatus ?(<Link href="/auth/signup" className="px-6 py-3 border border-blue-600 rounded-xl hover:bg-[#082845] hover:text-white dark:hover:bg-gray-800">
            Join now
          </Link>):(
            <Link href="/home" className="px-6 py-3 border border-blue-600 rounded-xl hover:bg-[#082845] hover:text-white dark:hover:bg-gray-800">
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
  )
}

