import mongoose from "mongoose";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import Practice from "@/models/practice.models";
import getDataFromToken from "@/helpers/checkAuth";
import { saveBuffer } from "@/utils/saveBuffer";
import uploadOnCloudinary from "@/helpers/cloudinary";

connectDB();

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const instruction = formData.get("instruction") as string;
    const image = formData.get("image") as File;
    const video = formData.get("video") as File;
    const teacher = await getDataFromToken(request);
    if (!teacher) {
        return NextResponse.
            json({
                message: "Unauthenticated User"
            }, {
                status: 401
            });
    }
    if (teacher.isVerified === false || teacher.role !== "teacher") {
        return NextResponse.json({
            message: "User is not verified"
        }, {
            status: 401
        });
    }
    let uploadedImage = null;
    let uploadedVideo = null;
    if (image instanceof File && image.size > 0) {
        const tempFilePath = await saveBuffer(image);
        uploadedImage = await uploadOnCloudinary(tempFilePath);
        if (!uploadedImage) {
            return NextResponse.json({ message: "Error uploading image" }, { status: 500 });
        }
    }

    if (video instanceof File && video.size > 0) {
        const tempFilePath = await saveBuffer(video);
        uploadedVideo = await uploadOnCloudinary(tempFilePath);
        if (!uploadedVideo) {
            return NextResponse.json({ message: "Error uploading video" }, { status: 500 });
        }
    }

    try {
        const practice = await Practice.create({
            title,
            instruction,
            image,
            video
        });
        return NextResponse.
            json({
                message: "Practice created successfully",
                practice
            },
                {
                    status: 201

                });
    } catch (error) {
        console.error("Error creating practice:", error);
        return NextResponse.
            json({
                message: "Error creating practice"

            }, {
                status: 500

            });
    }
}