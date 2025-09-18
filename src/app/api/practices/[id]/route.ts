//get update delete
import mongoose from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/db/index";
import Practice from "@/models/practice.models";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
import { saveBuffer } from "@/utils/saveBuffer";
import uploadOnCloudinary from "@/helpers/cloudinary";

connectDB();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const practice = await Practice.findById(id);
        if (!practice) {
            throw new ApiError(404, "Practice not found");
        }
        return NextResponse.json({
            message: "Practice found successfully",
            practice,
        },
    {
        status: 200
    });
    } catch (error:unknown) {
        return NextResponse.json(
            {
                message: error instanceof ApiError ? error.message : "Error getting practice",
            },
            {
                status: error instanceof ApiError ? error.statusCode : 500
            }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getDataFromToken(req);

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        const {id} = await params;
        const practice = await Practice.findByIdAndDelete(id);
        if (!practice) {
            throw new ApiError(404, "Practice not found");
        }
        return NextResponse.json({
            message: "Practice deleted successfully",
            practice,
        },
    {
        status: 200
    });
    } catch (error:unknown) {
        return NextResponse.json(
            {
                message: error instanceof ApiError ? error.message : "Error deleting practice",
            },
            {
                status: error instanceof ApiError ? error.statusCode : 500
            });
        }
}

//needs to review
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {

        const user = await getDataFromToken(req);

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }

        if (user.isVerified === false || user.role !== "Admin") {
            throw new ApiError(401, "User is not verified");
        }

        const id =(await params).id;

        const formData = await req.formData();

        const practiceImage = formData.get('image') as File;
        const practiceVideo = formData.get('video') as File;

        
        const body = Object.fromEntries(formData) as {
            title: string;
            instruction: string;
            difficulty: string;
            xp: string;
            tags ?: string;
        };

        const { title, instruction, difficulty, xp } = body;
        
        [title, instruction, difficulty, xp].some(field => !field || field === undefined) && NextResponse.json({ message: "All fields are required" }, { status: 400 });


        const existingPractice = await Practice.findById(id);

        if (!existingPractice) {
            throw new ApiError(404, "Practice not found");
        }

        let image = existingPractice.image;
        let video = existingPractice.video;
        if(practiceImage) {
            const localFile = await saveBuffer(practiceImage);
            const uploadedFile = await uploadOnCloudinary(localFile);
            if(uploadedFile){
                image = uploadedFile?.secure_url;
            }
        }

        if(practiceVideo) {
            const localFile = await saveBuffer(practiceVideo);
            const uploadedFile = await uploadOnCloudinary(localFile);
            if(uploadedFile){
                video = uploadedFile?.secure_url;
            }
        }

        const practice = await Practice.findByIdAndUpdate(id, { title, instruction, difficulty, xp, image, video }, { new: true });

        if (!practice) {
            throw new ApiError(404, "Practice not found");
        }
        return NextResponse.json({
            message: "Practice updated successfully",
            practice,
        },
    {
        status: 200
    });
    } catch (error:unknown) {
        return NextResponse.json(
            {
                message: error instanceof ApiError ? error.message : "Error updating practice",
            },
            {
                status: error instanceof ApiError ? error.statusCode : 500
            });
        }
}
