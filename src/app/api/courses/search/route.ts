import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import Course from "@/models/course.models";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";

connectDB();

export async function GET(req: NextRequest) {
    try {
        const { _id: userId } = await getDataFromToken(req);

        if(!userId){
            throw new ApiError(401, "User not authenticated");
        }
        
        const { searchParams } = new URL(req.url);
        const query: string = searchParams.get("query") ?? "";

        const courses = await Course.aggregate([
            {
                $search: {
                    index: "course_autocomplete",
                    compound:{
                        should: [
                            {
                                autocomplete: {
                                    query: query,
                                    path: "name",
                                    fuzzy: {
                                        maxEdits: 2,
                                        prefixLength: 2
                                    },
                                    
                                }
                            },
                            {
                                autocomplete: {
                                    query: query,
                                    path: "tags",
                                    fuzzy: {
                                        maxEdits: 2,
                                        prefixLength: 2
                                    },
                                    score: {
                                        boost:{
                                            value: 2
                                        }
                                    }
                                    
                                }
                            },
                            {
                                text: {
                                    query: query,
                                    path: ["description","type"]
                                }

                            }
                        ]
                    }
                }
            },
            {
                $sort: {
                    _score:-1
                }
            }
        ])

        if (!courses || courses.length === 0) {
            throw new ApiError(404, "No courses found");
        }

        return NextResponse.json({
            message: "Courses fetched successfully",
            courses
        },
            {
                status: 200
            });

    } catch (error: unknown) {
        console.error("Error getting courses:", error);
        if (error instanceof ApiError) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        } else {
            return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
        }
    }
}