import mongoose from "mongoose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/db/index";
import Course from "@/models/course.models";
import getDataFromToken from "@/helpers/checkAuth";
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

        const latestCourses = await Course.find({})
            .sort({ createdAt: -1 })
            .limit(5)

        if (!latestCourses || latestCourses.length === 0) {
            throw new ApiError(404, "No courses found");
        }

        return NextResponse.json({
            message: "Latest courses fetched successfully",
            latestCourses
        }, {
            status: 200
        });


    } catch (error: unknown) {

        console.error("Error fetching courses:", error);

        if (error instanceof ApiError) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }

        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}