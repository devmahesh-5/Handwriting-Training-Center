import mongoose,{isValidObjectId} from "mongoose";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import StudentSolution from "@/models/studentPractice.models";
import getDataFromToken from "@/helpers/checkAuth";
import uploadOnCloudinary from "@/helpers/cloudinary";
import { saveBuffer } from "@/utils/saveBuffer";
connectDB();
export async function POST(request: NextRequest, { params }: { params: { practiceId: string } }) {
    try {
        const { practiceId } = params;
        if (!isValidObjectId(practiceId)) {
            return NextResponse.
            json(
                {
                    message: "Invalid practice ID",
                },
                {
                    status: 400,
                }
            );
        }
        const formData = await request.formData();
        const submissionFile = formData.get("submissionFile") as File;
        if (!submissionFile) {
            return NextResponse.
            json(
                {
                    message: "Submission file is required",
                },
                {
                    status: 400,
                }
            );
        }

        

        const user = await getDataFromToken(request);
        if (!user) {
            return NextResponse.
            json(
                {
                    message: "Unauthenticated User",
                },
                {
                    status: 401,
                }
            );
        }
        if (user.isVerified === false) {
            return NextResponse.
            json(
                {
                    message: "User is not verified",
                },
                {
                    status: 401,
                }
            );
        }

        const tempFilePath = await saveBuffer(submissionFile);
        const uploadedSubmissionFile = await uploadOnCloudinary(tempFilePath);

        if (!uploadedSubmissionFile) {
            return NextResponse.
            json(
                {
                    message: "Error uploading submission file",
                },
                {
                    status: 500,
                }
            );
        }

        const practiceSolution = await StudentSolution.create({
            student: user._id,
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
    } catch (error: any) {
        console.error("Error creating classroom:", error);
        return NextResponse.
        json({
             message: error.message || "Error creating classroom" 
            
        },
             { 
            status: 500 
            
        });
    }
}