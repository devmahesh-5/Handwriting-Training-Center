import StudentSolution from "@/models/studentPractice.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "@/utils/ApiError";
import User from "@/models/users.models";

connectDB();

export async function GET(request: NextRequest, { params }: { params: Promise<{ classroomId: string, practiceId: string }> }) {
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

        const { classroomId, practiceId } = await params;


        if (!isValidObjectId(classroomId)) {
            throw new ApiError(404, "invalid classroom id");
        }

        if (practiceId && !isValidObjectId(practiceId)) {
            throw new ApiError(404, "invalid practice id");
        }

        const solutions = await StudentSolution.aggregate([
            {
                $match: {
                    $and: [
                        { practice: new mongoose.Types.ObjectId(practiceId) },
                        { classroom: new mongoose.Types.ObjectId(classroomId) },
                        { student: new mongoose.Types.ObjectId(userId) }
                    ]
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "student",
                    foreignField: "_id",
                    as: "student",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                fullName: 1,
                                profilePicture: 1
                            },
                        },
                    ]
                },
            },
            {
                $lookup: {
                    from: "practices",
                    localField: "practice",
                    foreignField: "_id",
                    as: "practice",
                },
            },
            {
                $project: {
                    student: { $first: "$student" },
                    practice: { $first: "$practice" },
                    status: 1,
                    submissionFile: 1,
                    feedback: 1,
                    marks: 1,
                },
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