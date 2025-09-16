'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import Loading from '@/components/Loading';

/*
student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    classroom: {//it will be assigned by admin later after verification
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
    },
    paymentProof:{
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Subscribed', 'Failed'],
        default: 'Pending',
        required: true,
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true
    }
*/

interface Props {
    _id?: string,
    student: User,
    classroom?: string | null,
    paymentProof: string,
    status: string,
    course: Course,
}

const SubscriptionCard = (props: Props) => {
    const {
    _id,
    student,
    classroom,
    paymentProof,
    status,
    course
} = props;

const router = useRouter();

return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all hover:shadow-xl">
        {/* Ticket-style header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold">{course.name}</h3>
                    <p className="text-blue-100 text-sm">{status}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    status === 'Subscribed' ? 'bg-green-500' : 
                    status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                    {status}
                </span>
            </div>
        </div>

        <div className="p-5">
            {/* Student Info */}
            <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 mr-4">
                    <Image 
                        src={student?.profilePicture || `/profile.png`} 
                        alt="Profile" 
                        fill
                        className="rounded-full object-cover border-2 border-gray-200"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-md font-semibold text-gray-900 truncate">{student.fullName}</h2>
                    <p className="text-sm text-gray-600 truncate">{student.email}</p>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-300 my-4"></div>

            {/* Payment Proof Preview */}
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Payment Proof</p>
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                        src={paymentProof}
                        alt="Payment proof"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-between items-center mt-6">
                <button
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        classroom 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                            : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    }`}
                    onClick={() => classroom && router.push(`/classroom/${classroom}`)}
                    disabled={!classroom}
                >
                    {classroom ? 'Enter Classroom →' : 'Pending Approval'}
                </button>
                
                <span className="text-xs text-gray-500">
                    ID: {_id?.slice(-8)}
                </span>
            </div>
        </div>

        {/* Ticket perforation effect */}
        <div className="relative h-2 bg-gray-100 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-full flex justify-between px-2">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-white rounded-full -mt-1"></div>
                ))}
            </div>
        </div>
    </div>
);
    


}

export default SubscriptionCard