import connectDB from "@/db/index";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
import mongoose, { isValidObjectId } from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import Whiteboard from "@/models/whiteboard.models";
connectDB();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { _id:userId } = await getDataFromToken(request);

        if (!userId) {
            throw new ApiError(401, 'Unauthorized Access');
        }
        const { id } = await params;
        if (!id || !isValidObjectId(id)) {
            throw new ApiError(400, 'Whiteboard ID is required');
        }

        const whiteboard = await Whiteboard.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                    
                },
            },
            {
                $lookup: {
                    from: 'classrooms',
                    localField: 'classroomId',
                    foreignField: '_id',
                    as: 'classroom',
                },
            },
            {
                $project: {
                    classroom: {
                        $first: '$classroom',
                    },
                    _id: 1,
                    name: 1,
                    owner: 1,
                    isPasswordProtected: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    drawing: 1
                },
            }
            
        ])
        
        if (!whiteboard) {
            throw new ApiError(404, 'Whiteboard not found');
        }

        return NextResponse.
            json({
                message: 'Whiteboard found successfully',
                whiteboard
            }, {
                status: 200
            });

    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        } else {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }
}