import mongoose, { isValidObjectId } from "mongoose";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import StudentSolution from "@/models/studentPractice.models";
import getDataFromToken from "@/helpers/checkAuth";
import uploadOnCloudinary from "@/helpers/cloudinary";
import { saveBuffer } from "@/utils/saveBuffer";
import { ApiError } from "@/utils/ApiError";
import User from "@/models/users.models";


connectDB();


export async function POST(request: NextRequest, { params }: { params: Promise<{ classroomId: string, practiceId: string }> }) {
    try {
        const { classroomId, practiceId } = await params;

        if (!isValidObjectId(practiceId)) {
            throw new ApiError(404, "invalid practice id");
        }
        const formData = await request.formData();

        const submissionFile = formData.get("submissionFile") as File;

        if (!submissionFile) {
            throw new ApiError(400, "Submission file is required");
        }



        const { _id: userId } = await getDataFromToken(request);

        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.isVerified === false) {
            throw new ApiError(400, "User is not verified");
        }

        const tempFilePath = await saveBuffer(submissionFile);
        const uploadedSubmissionFile = await uploadOnCloudinary(tempFilePath);

        if (!uploadedSubmissionFile) {
            throw new ApiError(500, "Error uploading submission file");
        }

        const practiceSolution = await StudentSolution.create({
            student: user._id,
            classroom: classroomId,
            practice: practiceId,
            submissionFile: uploadedSubmissionFile.secure_url
        });

        return NextResponse.
            json({
                message: "Practice solution submitted successfully",
                practiceSolution
            },
                {
                    status: 200
                });
    } catch (error: unknown) {

        console.error("Error creating classroom:", error);
        
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error creating classroom"

            },
                {
                    status: error instanceof ApiError ? error.statusCode : 500

                });
    }
}