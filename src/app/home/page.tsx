'use client'
import React, { useState } from 'react'
import Header from "@/components/Header";
import { useSelector } from 'react-redux';
import Link from 'next/link';
import Input from '@/components/Input';
import { MdNotifications } from 'react-icons/md';
import Image from 'next/image';
import Logo from '@/components/LOGO';
function DashboardPage() {
    const authStatus = useSelector((state: { auth: { status: boolean; userData: userData; } }) => state.auth.status);
    const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);
   

    return (
        <main className="min-h-screen dark:bg-gray-900 bg-[#F2F4F7]">
            <Header />
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-300'>
                <div >hey</div>
                <div>hey1</div>
                <div>hey1</div>
                <div>hey1</div>
                <div>hey1</div>
                <div>hey1</div>

            </div>

        </main>
    )
}

export default DashboardPage
