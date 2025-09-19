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
        const { _id } = await getDataFromToken(request);

        const user = await User.findById(_id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.isVerified === false) {
            throw new ApiError(400, "User is not verified");
        }

        if (user.role !== "Student") {
            throw new ApiError(403, "Only students can submit practice solutions");
        }

        const { classroomId, practiceId } = await params;

        if (!isValidObjectId(practiceId)) {
            throw new ApiError(404, "invalid practice id");
        }
        const formData = await request.formData();

        if (!formData) {
            throw new ApiError(400, "Submission data is required");
        }

        const submissionFile = formData.get("submissionFile") as File;

        if (!submissionFile) {
            throw new ApiError(400, "Submission file is required");
        }

        const tempFilePath = await saveBuffer(submissionFile);

        if (!tempFilePath) {
            throw new ApiError(500, "Error saving submission file");
        }
        const uploadedSubmissionFile = await uploadOnCloudinary(tempFilePath);

        if (!uploadedSubmissionFile) {
            throw new ApiError(500, "Error uploading submission file");
        }

        const existingSolution = await StudentSolution.findOne({
            student: user._id,
            classroom: classroomId,
            practice: practiceId
        });
        let practiceSolution;

        if (existingSolution) {
            // If a solution already exists, update it

            //clear users previous xp
            const updatedUser = await User.findByIdAndUpdate(user._id, {
                $inc: {
                    xp: -existingSolution.marks
                }
            },
                {
                    new: true
                })
                
            practiceSolution = await StudentSolution.findByIdAndUpdate(existingSolution._id, {
                submissionFile: uploadedSubmissionFile.secure_url,
                status: 'Pending', // Reset status to 'Submitted' on resubmission
                feedback: '', // Clear previous feedback
                marks: null // Clear previous marks
            }, { new: true });
        } else {
            practiceSolution = await StudentSolution.create({
                student: user._id,
                classroom: classroomId,
                practice: practiceId,
                submissionFile: uploadedSubmissionFile.secure_url
            });
        }

        return NextResponse.
            json({
                message: "Practice solution submitted successfully",
                practiceSolution
            },
                {
                    status: 200
                });
    } catch (error: unknown) {

        console.error("Error submitting practice solution:", error);

        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error submitting practice solution",

            },
                {
                    status: error instanceof ApiError ? error.statusCode : 500

                });
    }
}