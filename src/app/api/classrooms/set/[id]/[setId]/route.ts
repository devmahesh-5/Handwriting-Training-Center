import mongoose from 'mongoose';
import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/db/index';
import Classroom from '@/models/classroom.models';
import getDataFromToken from '@/helpers/checkAuth';
import { ApiError } from '@/utils/ApiError';
import User from '@/models/users.models';

connectDB();

export async function PATCH(req: NextRequest,{ params }: { params: Promise<{ id: string; setId: string }> }) {
    try {
        const { id, setId } = await params;

        const user = await getDataFromToken(req);

        if (!user) {
            throw new ApiError(401, 'User Session expired or not logged in');
        }

        if (user.isVerified === false) {
            throw new ApiError(401, 'User is not verified');
        }

        if (user.role !== 'admin') {
            throw new ApiError(403, 'Unauthorized access');
        }

        const updatedClassroom = await Classroom.findByIdAndUpdate(
            id,
            {
                $set:{
                    practiceSet: setId
                }
            },
            {
                new: true
            }
        );

        if (!updatedClassroom) {
            throw new ApiError(404, 'Classroom not found');
        }

        return NextResponse.json(
            {
                message: 'Classroom updated successfully',
                updatedClassroom
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Error updating classroom:', error);

        if (error instanceof ApiError) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }

        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}