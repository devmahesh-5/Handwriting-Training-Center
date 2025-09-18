import mongoose from 'mongoose';
import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/db/index';
import getDataFromToken from '@/helpers/checkAuth';
import { ApiError } from '@/utils/ApiError';
import { isValidObjectId } from 'mongoose';
import PracticeEntry from '@/models/practiceEntry.models';

connectDB();

export async function GET(req: NextRequest) {
    try {

        const user = await getDataFromToken(req);

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }

        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }
        
        if(user.role !== "Admin") throw new ApiError(401, "only admin can get practice entry");

        const practiceEntries = await PracticeEntry.aggregate([
            {
                $match: {  }
            },
            {
                $lookup: {
                    from: "practices",
                    localField: "practice",
                    foreignField: "_id",
                    as: "practice"
                }
            },
            {
                $addFields: {
                    practice: { $arrayElemAt: ["$practice", 0] }
                }
            }

        ])

        if (!practiceEntries) {
            throw new ApiError(404, "Practice Entry not found");
        }
        return NextResponse.json(
            {
                message: "Practice Entry fetched successfully",
                practiceEntries
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