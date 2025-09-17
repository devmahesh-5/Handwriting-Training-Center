import Courses from "@/models/course.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
import mongoose,{isValidObjectId} from "mongoose";

connectDB();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string, practiceSetId: string }> }) {
    try {
        const user = await getDataFromToken(req);

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        
        if (user.isVerified === false || user.role !== "Admin") {
            throw new ApiError(401, "User is not Authorized.");
        }

        const { id, practiceSetId } = await params;

        if (!isValidObjectId(id) || !isValidObjectId(practiceSetId)) {
            throw new ApiError(400, "Invalid course ID or practice set ID");
        }

        const course = await Courses.findByIdAndUpdate(id, {
            $addToSet: {
                practiceSet: practiceSetId
            }
        }, {
            new: true
        });

        return NextResponse.
            json({
                message: "Practice set added successfully",
                course
            },
                {
                    status: 200
                });
    } catch (error: unknown) {
        console.error("Error adding practice set:", error);
        return NextResponse.
        json({
             message: error instanceof ApiError ? error.message : "Error adding practice set" }, { 
            status: error instanceof ApiError ? error.statusCode : 500
         });
    }
}