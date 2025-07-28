

'use client'
import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import Link from 'next/link';
import Input from '@/components/Input';
import { MdNotifications } from 'react-icons/md';
import Image from 'next/image';
import Logo from '@/components/LOGO';

export default function Header() {
     const authStatus = useSelector((state: { auth: { status: boolean; userData: userData; } }) => state.auth.status);
    const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);
    const [error, setError] = useState(null);

    const navItems = [
        { name: 'Home', slug: '/', active: authStatus },
        { name: 'Course', slug: '/course', active: authStatus },
        { name: 'Dashboard', slug: '/dashboard', active: authStatus },
        { name: 'Self Learning', slug: '/self-learning', active: authStatus },
        // { name: 'messages', slug: '/messages/ib', active: authStatus },
        // { name: 'Profile', slug: '/users/myprofile', active: authStatus, icon: <MdPerson /> },
    ];
  
    return (
         <header className='flex flex-row justify-between mx-auto w-4/5 py-4'>
                <div className='flex flex-row items-center'>
                    <Image 
                    src="/logo_icon.png" 
                    alt="logo" 
                    width={30} 
                    height={30}
                    objectFit='cover'
                    className='rounded-full'
                     />
                    <h1 className='text-2xl font-bold ml-2 text-gray-700 dark:text-[#F2F4F7]'>HT-Center</h1>
                </div>

                <div className='flex flex-row bg-gray-300 dark:bg-gray-600 dark:text-[#F2F4F7] rounded-full'>
                    {
                        navItems.map((item, index) => (
                            <div key={index} className={`px-4 py-2 hover:bg-gray-400 dark:hover:bg-gray-400 rounded-full cursor-pointer ${item.active ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                                <Link href={item.slug}>{item.name}</Link>
                            </div>
                        ))
                    }
                </div>

                <div className='flex flex-row items-center'>
                    <Link href="/my-classroom" className={`px-4 py-2 rounded-full hover:bg-gray-400 dark:text-[#F2F4F7] bg-gray-300 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-400 cursor-pointer`}>Classroom</Link>
                </div>

                <div className='flex flex-row'>
                    <Input placeholder='Search for courses' className='px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-200 cursor-pointer' />
                </div>

                

                <div className='flex flex-row'>
                    <button className='rounded-full dark:text-white text-gray-600 cursor-pointer w-8 h-8'><MdNotifications /></button>
                    
                                <Image
                                    src={userData?.profilePicture || "/profile.png"}
                                    alt="profile"
                                    width={12}
                                    height={12}
                                    className="rounded-full cursor-pointer w-8 h-8"
                                    objectFit='cover'
                                />
                        
                    
                </div>

            </header>
    )
}