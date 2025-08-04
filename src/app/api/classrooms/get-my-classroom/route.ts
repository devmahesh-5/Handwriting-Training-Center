import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/db/index";
import Classroom from "@/models/classroom.models";
import getDataFromToken from "@/helpers/checkAuth";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "@/utils/ApiError";
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


        const classroom = await Classroom.aggregate(
            [
                {
                    $match: {
                        $or: [
                            { students: new mongoose.Types.ObjectId(user._id) },
                            { teacher: new mongoose.Types.ObjectId(user._id) }
                        ]

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
                        as: "course"
                    }
                },
                {
                    $lookup: {
                        from: "courses",
                        localField: "course",
                        foreignField: "_id",
                        as: "course"
                    }
                },
                {
                    $lookup: {
                        from: "payments",
                        localField: "payment",
                        foreignField: "_id",
                        as: "payment"
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
                        practiceSet: { $first: "$practiceSet" },
                        course: { $first: "$course" },
                        payment: { $first: "$payment" },
                        subscription: { $first: "$subscription" },
                        teacher: { $first: "$teacher" },


                    }
                },
                {
                    $addFields: {
                        "totalXp":{
                            $reduce: {
                                input: "$practiceSet.practiceEntries",
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
        )

        console.log("Classroom Data:", classroom);
        

        if (!classroom || classroom.length === 0) {
            throw new ApiError(404, "No classroom found for this student");
        }

        return NextResponse.json({
            message: "Classroom fetched successfully",
            classroom
        }, {
            status: 200
        });

    } catch (error: unknown) {
        console.error("Error creating classroom:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error creating classroom"
            }, {
                status: 500
            });
    }
}
