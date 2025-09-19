import mongoose from 'mongoose';
import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/db/index';
import getDataFromToken from '@/helpers/checkAuth';
import { ApiError } from '@/utils/ApiError';
import { isValidObjectId } from 'mongoose';
import PracticeEntry from '@/models/practiceEntry.models';

connectDB();

export async function Patch(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {

        const user = await getDataFromToken(req);

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }

        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }
        
        if(user.role !== "Teacher") throw new ApiError(401, "only Teacher can Unlock practice entry");

       const { id } = await params;

        if (!isValidObjectId(id)) {
            throw new ApiError(400, "Invalid Practice Entry ID");
        }

        const updatedPracticeEntry = await PracticeEntry.findByIdAndUpdate(id, { $set: { status: "Unlocked" } }, { new: true });

        if (!updatedPracticeEntry) {
            throw new ApiError(404, "Practice Entry not found");
        }
        return NextResponse.json(
            {
                message: "Practice Entry fetched successfully",
                updatedPracticeEntry
            },
            {
                status: 200
            }
        );



    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        } else {
            return NextResponse.json({ error: "Something went wrong while fetching practice entry" }, { status: 500 });
        }
    }
}