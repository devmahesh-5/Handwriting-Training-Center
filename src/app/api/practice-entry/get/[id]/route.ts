import mongoose from 'mongoose';
import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/db/index';
import getDataFromToken from '@/helpers/checkAuth';
import { ApiError } from '@/utils/ApiError';
import { isValidObjectId } from 'mongoose';
import PracticeEntry from '@/models/practiceEntry.models';

connectDB();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {

        const { id } = await params;
        const user = await getDataFromToken(req);
        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        if (!isValidObjectId(id)) {
            throw new ApiError(400, "Invalid Practice Entry ID");
        }

        const practiceEntry = await PracticeEntry.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                }
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

        if (!practiceEntry) {
            throw new ApiError(404, "Practice Entry not found");
        }
        return NextResponse.json(
            {
                message: "Practice Entry fetched successfully",
                practiceEntry
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