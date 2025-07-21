import Courses from "@/models/course.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
connectDB();

export async function GET(req: NextRequest) {
    try {
        const type = req.nextUrl.searchParams.get('type');
        
        const user = await getDataFromToken(req);
        if (!user) {
            
            throw new Error("User Session expired or not logged in");
        }
        if(user.isVerified===false){
            throw new Error("User is not verified");
        }
        if (!type) {
            return NextResponse.json({ message: "Type is required" }, { status: 400 });
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
                    $lookup:{
                        from:"practicesets",
                        localField:"practiceSet",
                        foreignField:"_id",
                        as:"practiceset"
                    }
                },
                {
                    $addFields: {
                        teacher:{
                            $first:"$teacher"
                        }
                    }
                }

            ]
        )
        return NextResponse.
            json(
                {
                    message:"Course fetched successfully",
                    course
                },
                {
                    status: 200

                });
        
    } catch (error: any) {
        console.error("Error fetching course:", error);
        return NextResponse.json({ message: error.message || "Error fetching course" }, { status: 500 });
    }
}

