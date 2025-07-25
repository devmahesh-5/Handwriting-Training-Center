//search to do
import Courses from "@/models/course.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";

connectDB();
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const user = await getDataFromToken(req);
        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }

        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }


        const { name, description, type, price, duration } = body;

        if ([name, description, type, price, duration].some(field => !field || field === undefined)) {
            throw new ApiError(400, "All fields are required");
        }

        const course = await Courses.create({ name, description, type, price, duration });

        return NextResponse.
            json({
                message: "Course created successfully",
                course
            }, {
                status: 201
            });
    } catch (error: unknown) {
        console.error("Error creating course:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error creating course"
            }, {
                status: error instanceof ApiError ? error.statusCode : 500
            });
    }
}