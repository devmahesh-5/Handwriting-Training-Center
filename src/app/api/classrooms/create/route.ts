import mongoose from "mongoose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/db/index";
import Classroom from "@/models/classroom.models";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
import User from "@/models/users.models";


connectDB();

export async function POST(req: NextRequest) {
    try {
        const {name, description} = await req.json();
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");

        if (!name || !description) {
            throw new ApiError(400, "Name and description are required");
        }
        const { _id: userId } = await getDataFromToken(req);

        if (!mongoose.isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }
        const user = await User.findById(userId);

        if(user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access");
        }

        if (!user) {
            throw new ApiError(401, "User not authenticated");
        }

        const classroom = await Classroom.create({
            name,
            description,
            course: courseId,
        });
        
        if(!classroom){
            throw new ApiError(500,"could not create classroom")
        }
        
        return NextResponse.json(classroom);
        
    } catch (error: unknown) {

        console.error("Error creating classroom:", error);


        if (error instanceof ApiError) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        

        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}