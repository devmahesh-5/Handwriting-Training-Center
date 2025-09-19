import StudentSolution from "@/models/studentPractice.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "@/utils/ApiError";
import User from "@/models/users.models";

connectDB();

export async function GET(request: NextRequest, { params }: { params: Promise<{ classroomId: string }> }) {
    try {
        const { _id: userId } = await getDataFromToken(request);

        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.isVerified === false) {
            throw new ApiError(400, "User is not verified");
        }

        if(user.role !== 'Student'){
            throw new ApiError(403, "Access denied");
        }

        const { classroomId, } = await params;


        if (!isValidObjectId(classroomId)) {
            throw new ApiError(404, "invalid classroom id");
        }

       

        const solutions = await StudentSolution.aggregate([
            {
                $match: {
                    $and: [
                        { classroom: new mongoose.Types.ObjectId(classroomId) },
                        { student: new mongoose.Types.ObjectId(userId) }
                    ]
                },
            },
            {
                $group: {
                    _id: "$student",
                    currentMarks: { $sum: "$marks" },
                }
            }
            
        ])

        return NextResponse.
            json({
                message: "Practice solutions fetched successfully",
                solutions
            }, {
                status: 200
            });

    } catch (error: unknown) {
        console.error("Error getting practice:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error getting practice"
            },
                {
                    status: error instanceof ApiError ? error.statusCode : 500

                });
    }
}