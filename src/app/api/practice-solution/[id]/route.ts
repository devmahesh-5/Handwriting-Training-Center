import StudentSolution from "@/models/studentPractice.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import mongoose, { isValidObjectId } from "mongoose";

connectDB();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getDataFromToken(request);
        if (!user) {
            return NextResponse.json(
                {
                    message: "Unauthenticated User",
                },
                {
                    status: 401,
                }
            );
        }
        if (user.isVerified === false) {
            return NextResponse.json(
                {
                    message: "User is not verified",
                },
                {
                    status: 401,
                }
            );
        }
        const { id } = params;
        if(!isValidObjectId(id)){
            return NextResponse.json(
                {
                    message: "Invalid practice solution ID",
                },
                {
                    status: 400,
                }
            );
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
    } catch (error) {
        console.error("Error getting practice:", error);
        return NextResponse.
            json({
                message: "Error getting practice"
            },
                {
                    status: 500

                });
    }
}


export async function PATCH(request: NextRequest, { params }: { params: { id: string} }) {
    try {
        const { id } = params;
        // const studentId = request.nextUrl.searchParams.get("studentId");
        const user = await getDataFromToken(request);
        if (!user || !isValidObjectId(id)) {
            return NextResponse.json(
                {
                    message: "Unauthenticated User",
                },
                {
                    status: 401,
                }
            );
        }
        if (!user.isVerified || user.role !== "teacher") {
            return NextResponse.json(
                {
                    message: "User not authorized to mark the practice solution",
                },
                {
                    status: 401,
                }
            );
        }
        const { status, feedback, marks } = await request.json();
        const updatedPracticeSolution = await StudentSolution.findByIdAndUpdate(id, {
            $set :{
                status,
                feedback,
                marks
            }
        }, { 
            new: true 
        });

        return NextResponse.
            json({
                message: "Practice updated successfully",
                updatedPracticeSolution
            }, {
                status: 200
            });

    } catch (error: any) {
        return NextResponse
            .json({
                message: error.message || "Error updating practice",
            },
                {
                    status: 500
                });
    }
}