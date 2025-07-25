import mongoose from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/db/index";
import Classroom from "@/models/classroom.models";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
import { isValidObjectId } from "mongoose";


connectDB();


export async function PATCH(req: NextRequest, { params }: { params: { id: string, teacherId: string } }) {
    try {

        const { id, teacherId } = params;
        const user = await getDataFromToken(req);

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }

        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }

        if (!isValidObjectId(id) || !isValidObjectId(teacherId)) {
            throw new ApiError(400, "Invalid classroom id or teacher id");
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