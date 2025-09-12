'use client'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import Link from 'next/link';
import Input from '@/components/Input';
import { MdArrowDownward, MdArrowDropDownCircle, MdDetails, MdNotifications, MdOutlineArrowUpward } from 'react-icons/md';
import Image from 'next/image';
import Logo from '@/components/LOGO';
import LogoutBtn from './logoutBtn';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const authStatus = useSelector((state: { auth: { status: boolean; userData: userData; } }) => state.auth.status);
    const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);
    const [error, setError] = useState(null);

    const navItems = [
        { name: 'Home', slug: '/home', active: authStatus },
        { name: 'Course', slug: '/course', active: authStatus },
        { name: 'About', slug: '/', active: authStatus },
        { name: 'Self', slug: '/self-learning', active: authStatus },
    ];


    return (
        <header className={`bg-[#F2F4F7] dark:bg-gray-900 dark:text-[#F2F4F7] sticky top-0 z-50`}>
            <nav className='flex flex-row justify-between items-center mx-auto w-full px-4 py-3 w-11/12 md:py-4'>
                {/* Logo */}
                <div className='flex flex-row items-center'>
                    <Image
                        src="/logo_icon.png"
                        alt="logo"
                        width={30}
                        height={30}
                        className='rounded-full'
                    />
                    <h1 className='hidden lg:inline text-2xl font-bold ml-2 text-gray-700 dark:text-[#F2F4F7]'>HT-Center</h1>
                </div>

                {/* Desktop Navigation */}
                <div className='hidden md:flex flex-row bg-gray-300 dark:bg-gray-600 dark:text-[#F2F4F7] rounded-full'>
                    {navItems.map((item, index) => (
                        <div key={index} className={`px-4 py-2 hover:bg-gray-400 dark:hover:bg-gray-400 rounded-full cursor-pointer`}>
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

                <div className="md:hidden flex items-center space-x-3">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`px-3 py-1.5 rounded-full dark:text-[#F2F4F7] bg-gray-300 dark:bg-gray-600 flex items-center`}
                    >
                        Home {isOpen ? <MdOutlineArrowUpward className="ml-1" /> : <MdArrowDropDownCircle className="ml-1" />}
                    </button>

                </div>



                {/* Search - Hidden on mobile */}
                <div className='hidden min-[400px]:flex flex-row'>
                    <Input
                        placeholder='Search for courses'
                        className='px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-200 cursor-pointer'
                    />
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
                {isOpen && (
                    <div className='fixed top-16 left-6 max-[400px]-left-4 md:hidden bg-gray-300 dark:bg-gray-500 dark:text-[#F2F4F7] w-48 rounded-lg shadow-xl z-50'>
                        <div className='flex flex-col py-2'>
                            {navItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.slug}
                                    className={`px-4 py-2 hover:bg-gray-400 dark:hover:bg-gray-400 ${item.active ? 'bg-gray-200 dark:bg-gray-700 dark:bg-gray-400' : ''}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            
                            <Link
                                href="/my-classroom"
                                className='px-4 py-2 bg-gray-200 hover:bg-gray-400 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700 dark:bg-gray-500'
                                onClick={() => setIsOpen(false)}
                            >
                                Classroom
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
}