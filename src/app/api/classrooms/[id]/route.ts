import mongoose from "mongoose";
import Classroom from '@/models/classroom.models.js'
import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/db/index";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
import { isValidObjectId } from "mongoose";

connectDB();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    const { id } = await params;
    const user = await getDataFromToken(req);

    if (!isValidObjectId(id)) {

        throw new ApiError(400, "Invalid Classroom ID");
    }

    try {

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }

        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }

        const classroom = await Classroom.aggregate(
            [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id),
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "students",
                        foreignField: "_id",
                        as: "students"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "teacher",
                        foreignField: "_id",
                        as: "teacher"
                    }
                },

                {
                    $lookup: {
                        from: "courses",
                        localField: "course",
                        foreignField: "_id",
                        as: "course",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "practicesets",
                                    localField: "practiceSet",
                                    foreignField: "_id",
                                    as: "practiceSet",
                                    pipeline: [
                                        {
                                            $lookup: {
                                                from: "practiceentries",
                                                localField: "practiceEntry",
                                                foreignField: "_id",
                                                as: "practiceEntries",
                                                pipeline: [
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
                                                            practice: { $first: "$practice" }
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $addFields: {
                                    practiceSet: { $first: "$practiceSet" }
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "subscriptions",
                        localField: "subscription",
                        foreignField: "_id",
                        as: "subscription"
                    }
                },
                {
                    $addFields: {
                        course: { $first: "$course" },
                        payment: { $first: "$payment" },
                        subscription: { $first: "$subscription" },
                        teacher: { $first: "$teacher" },
                    }
                },
                {
                    $addFields: {
                        "totalXp": {
                            $reduce: {
                                input: "$course.practiceSet.practiceEntries",
                                initialValue: 0,
                                in: { $add: ["$$value", "$$this.totalMarks"] }
                            }
                        }
                    }
                },
                {
                    $project: {
                        "students.password": 0,
                        "teacher.password": 0,
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                }


            ]
        );

        if (!classroom) {
            throw new ApiError(404, "Classroom not found");
        }

        return NextResponse
            .json({
                message: "Classroom fetched successfully",
                classroom,

            }, {
                status: 200
            });

    } catch (error: unknown) {

        console.error("Error getting classroom:", error);

        if (error instanceof ApiError) {

            return NextResponse.json({
                message: error.message
            }, {
                status: error.statusCode
            });

        } else {

            return NextResponse.json({
                message: "Internal Server Error"
            }, {
                status: 500
            });

        }


    }
}
