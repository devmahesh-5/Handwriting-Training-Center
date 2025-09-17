'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import {MdNotifications} from 'react-icons/md';
import Image from 'next/image';
import Logo from '@/components/LOGO';
import LogoutBtn from './logoutBtn';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '@/store/authSlice';
import axios, { AxiosError } from 'axios';
import { usePathname } from 'next/navigation';

export default function Header() {
    const pathname = usePathname();
    const authStatus = useSelector((state: { auth: { status: boolean; userData: userData; } }) => state.auth.status);
    const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navItems = [
        { name: 'Home', slug: '/home', active: authStatus },
        { name: 'Courses', slug: '/courses', active: authStatus },
        { name: 'About', slug: '/about', active: authStatus },
        { name: 'Subscription', slug: '/my-subscriptions', active: authStatus },
    ];

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setError(null);
                setLoading(true);
                const user = await axios.get('/api/users/me');
                dispatch(login(user.data.user));
            } catch (error: unknown) {
                dispatch(logout());
                error instanceof AxiosError ? setError(error.response?.data?.message) : setError("Something went wrong");
            } finally {
                setLoading(false);
            }

        }
        fetchUser();

    }, [dispatch]);

    const isWhiteboardPath = pathname.startsWith('/my-classroom/whiteboard/');

    if (isWhiteboardPath) {
        return (
            <div className='hidden'>
            </div>
        );
    }


    return authStatus ? (
        <header className={`bg-[#F2F4F7] dark:bg-gray-800 dark:text-[#F2F4F7] sticky top-0 z-50 px-4`}>
            <nav className='flex flex-row justify-between items-center mx-auto px-2 py-2 w-full md:w-11/12 md:py-2'>
                {/* Logo */}
                <div className='flex flex-row items-center'>
                    <Image
                        src="/logo_icon.png"
                        alt="logo"
                        width={60}
                        height={60}
                        className='rounded-full'
                    />
                    {/* <h1 className='hidden lg:inline text-2xl font-bold ml-2 text-gray-700 dark:text-[#F2F4F7]'>HT-Center</h1> */}
                </div>

                {/* Desktop Navigation */}
                <div className='hidden md:flex flex-row bg-gray-300 dark:bg-gray-600 dark:text-[#F2F4F7] rounded-full'>
                    {navItems.map((item, index) => (
                        <div key={index} className={`px-4 py-2 hover:bg-gray-400 dark:hover:bg-gray-400 rounded-full cursor-pointer ${item.slug === pathname ? 'bg-gray-400 dark:bg-gray-400' : ''}`}>
                            <Link href={item.slug}>{item.name}</Link>
                        </div>
                    ))}
                </div>

                {/* Desktop Classroom Button */}
                <div className='hidden md:flex flex-row items-center'>
                    <Link href="/my-classroom" className={`px-4 py-2 rounded-full hover:bg-gray-400 dark:text-[#F2F4F7] bg-gray-300 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-400 cursor-pointer`}>
                        Classroom
                    </Link>
                </div>


                <div className='flex flex-row items-center space-x-3'>

                    <button className='rounded-full dark:text-white text-gray-600 cursor-pointer w-8 h-8 inline-flex items-center justify-center'>
                        <MdNotifications />
                    </button>

                    <img
                        src={userData?.profilePicture || "/profile.png"}
                        alt="profile"
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 dark:border-gray-600 left-0 top-0"
                    />
                    {
                        (
                            <LogoutBtn />
                        )
                    }
                </div>

                {/* Mobile Menu Dropdown */}

                <div className='fixed bottom-2 md:hidden bg-gray-300 dark:bg-gray-600 dark:text-[#F2F4F7] rounded-lg shadow-xl z-50 left-1/2 transform -translate-x-1/2'>
                    <div className='flex flex-row'>
                        {navItems.map((item, index) => (
                            <div key={index} className={`px-4 py-2 hover:bg-gray-400 dark:hover:bg-gray-400 rounded-full cursor-pointer ${item.slug === pathname ? 'bg-gray-400 dark:bg-gray-400' : ''}`}>
                                <Link href={item.slug}>{item.name}</Link>
                            </div>
                        ))}

                        <Link
                            href="/my-classroom"
                            className={`px-4 py-2 hover:bg-gray-400 dark:hover:bg-gray-400 rounded-full cursor-pointer`}
                        >
                            Classroom
                        </Link>
                    </div>
                </div>

            </nav>
        </header>
    ) : !loading && !authStatus ? (
        <header className="bg-white dark:bg-gray-900">
            <nav className="max-w-5xl mx-auto flex  items-center justify-between p-4">

                <div className="flex items-center">
                    <Logo />
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/auth/login" className="px-6 py-3 border border-blue-600 rounded-xl bg-white hover:bg-[#082845] hover:text-white dark:hover:bg-gray-800 dark:text-[#082845]">
                        Log In
                    </Link>
                    <Link href="/auth/signup" className="px-6 py-3 border border-blue-600 rounded-xl hover:bg-[#082845] hover:text-white dark:hover:bg-gray-800 dark:text-[#F2F4F7]">
                        Sign Up
                    </Link>
                </div>

            </nav>
        </header>
    ) : (
        <div className='bg-white dark:bg-gray-900 h-16 w-full'>
        </div>
    )
}