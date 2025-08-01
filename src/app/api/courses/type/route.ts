import Courses from "@/models/course.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
connectDB();

export async function GET(req: NextRequest) {
    try {
        const type = req.nextUrl.searchParams.get('type');

        const user = await getDataFromToken(req);
        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }
        if (!type) {
            throw new ApiError(400, "Type is required");
        }

        const course = Courses.aggregate(
            [
                {
                    $match: {
                        type
                    }
                },

                {
                    $lookup: {
                        from: "users",
                        localField: "teacher",
                        foreignField: "_id",
                        as: "teacher",
                        pipeline: [
                            {
                                $project: {
                                    _type: 1,
                                    name: 1,
                                    email: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "practicesets",
                        localField: "practiceSet",
                        foreignField: "_id",
                        as: "practiceset"
                    }
                },
                {
                    $addFields: {
                        teacher: {
                            $first: "$teacher"
                        }
                    }
                }

            ]
        )

        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        return NextResponse.
            json(
                {
                    message: "Course fetched successfully",
                    course
                },
                {
                    status: 200

                });

    } catch (error: unknown) {
        console.error("Error fetching course:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error fetching course"
            }, {
                status: error instanceof ApiError ? error.statusCode : 500
            });
    }
}

