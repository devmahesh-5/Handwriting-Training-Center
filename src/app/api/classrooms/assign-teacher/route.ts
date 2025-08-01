import mongoose from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/db/index";
import Classroom from "@/models/classroom.models";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
import { isValidObjectId } from "mongoose";
import User from "@/models/users.models";

connectDB();



export async function PATCH(req: NextRequest) {

    try {
        const user = await getDataFromToken(req);

        //i want to assign a teacher to a classroom and get id and teacher id from query

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const teacherId = searchParams.get("teacherId");
        

        if(!isValidObjectId(id) || !isValidObjectId(teacherId)){
            throw new ApiError(400, "Invalid classroom id or teacher id");
        }

        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== "Teacher") {
            throw new ApiError(404, "Teacher not found");
        }

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }

        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }

        if (user.role !== "admin") {
            throw new ApiError(401, "only admin can update classroom");
        }

        const updatedClassroom = await Classroom.
            findByIdAndUpdate(
                id, {
                teacher: teacherId
            }, {
                new: true
            });
        return NextResponse.
            json({
                message: "Classroom updated successfully",
                updatedClassroom
            }, {
                status: 201
            });


    } catch (error: unknown) {
        console.error("Error creating classroom:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error creating classroom"
            }, {
                status: error instanceof ApiError ? error.statusCode : 500
            });
    }
}