import StudentSolution from "@/models/studentPractice.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "@/utils/ApiError";
import User from "@/models/users.models";
import practiceEntry from "@/models/practiceEntry.models";

connectDB();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { _id: userId } = await getDataFromToken(request);

        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        if (user.isVerified === false) {
            throw new ApiError(400, "User is not verified");
        }
        const { id } = await params;

        if (!isValidObjectId(id)) {
            throw new ApiError(404, "invalid practice solution id");
        }

        const solutions = await StudentSolution.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
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
                    student: 1,
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


export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        //for teacher marking
        const { id } = await params;
        const {feedback, marks } = await request.json();
        // const studentId = request.nextUrl.searchParams.get("studentId");
        const { _id: userId } = await getDataFromToken(request);

        const user = await User.findById(userId);


        if (!user || !isValidObjectId(id)) {
            throw new ApiError(404, "User not Found")
        }
        //later change this

        if (user.role !== "Teacher") {
            throw new ApiError(401, "User not authorized to mark the practice solution")
        }

        const updatedPracticeSolution = await StudentSolution.findByIdAndUpdate(id, {
            $set: {
                status:'Checked',
                feedback,
                marks
            }
        }, {
            new: true
        });

        const updatedUser = await User.findByIdAndUpdate(updatedPracticeSolution?.student, {
            $inc: {
                xps: marks
            }
        },
            {
                new: true
            }
        );

        if(!updatedUser){
            throw new ApiError(404, "User not updated found");
        }

        return NextResponse.
            json({
                message: "Practice updated successfully",
                updatedPracticeSolution
            }, {
                status: 200
            });

    } catch (error: unknown) {

        return NextResponse
            .json({
                message: error instanceof ApiError ? error.message : "Error updating practice",
            },
                {
                    status: error instanceof ApiError ? error.statusCode : 500
                });
    }
}

