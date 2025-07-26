import mongoose,{
    isValidObjectId
} from "mongoose";

import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/db/index";
import Classroom from "@/models/classroom.models";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";

connectDB();

export async function PATCH(req: NextRequest, { params }: { params: { id: string, studentId: string } }) {
    try {
        const { id, studentId } = params;
        const user = await getDataFromToken(req);

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }

        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }

        if (!isValidObjectId(id) || !isValidObjectId(studentId)) {
            throw new ApiError(400, "Invalid classroom id or student id");
        }

        if (user.role !== "admin") {
            throw new ApiError(401, "only admin can update classroom");
        }

        const classroom = await Classroom.findByIdAndUpdate(
            id,
            {
                $addToSet: {
                    students: studentId
                }
            },
            {
                new: true
            }
        );

        if (!classroom) {
            throw new ApiError(404, "Classroom not found");
        }

        return NextResponse.
        json(
            {
                message: "Classroom updated successfully",
                classroom
            },
            {
                status: 200
            }
        )

    } catch (error: unknown) {
        return NextResponse.
        json(
            {
                message: error instanceof ApiError ? error.message : "Error deleting message"
            },
            {
                status: error instanceof ApiError ? error.statusCode : 500
            }
        )
        
    }
}