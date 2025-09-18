'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import Loading from './Loading';
import { User } from '@/interfaces/interfaces';

interface TeacherCardProps {
    teacher: User;
    classroomId?: string | undefined;
    handleTeacherActive: () => void
}

const TeacherCard = ({ teacher, classroomId, handleTeacherActive }: TeacherCardProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const assignTeacher = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.patch(`/api/classrooms/assign-teacher?id=${classroomId}&teacherId=${teacher._id}`);
            handleTeacherActive();
            router.refresh();
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data?.message || 'An error occurred while Assigning Teacher.');
            } else {
                setError('An error occurred while Assigning Teacher.');
            }
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className="flex items-center gap-4">
                <Image
                    src={teacher?.profilePicture || "/profile.png"}
                    alt={teacher?.fullName || "Teacher"}
                    width={48}
                    height={48}
                    className="rounded-full"
                />
                <div>
                    <p className="font-semibold text-gray-900">{teacher?.fullName}</p>
                    <p className="text-sm text-gray-600">{teacher?.email}</p>
                    {Array.isArray(teacher?.skills) && teacher.skills.length > 0 && (
                        <p className="text-sm text-gray-500">
                            {teacher.skills.join(", ")}
                        </p>
                    )}
                </div>
            </div>
            <button
                onClick={assignTeacher}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                {loading ? "Loading..." : "Assign"}
            </button>
        </div>
    );



}

export default TeacherCard