import mongoose from "mongoose";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import Practice from "@/models/practice.models";
import getDataFromToken from "@/helpers/checkAuth";
import { saveBuffer } from "@/utils/saveBuffer";
import uploadOnCloudinary from "@/helpers/cloudinary";
import { ApiError } from "@/utils/ApiError";

connectDB();

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const instruction = formData.get("instruction") as string;
    const image = formData.get("image") as File;
    const video = formData.get("video") as File;
    const user = await getDataFromToken(request);
    const xp = formData.get("xp") as string;
    const tags = formData.get("tags") as string;
    const difficulty = formData.get("difficulty") as string;

    [title, instruction, xp, tags, difficulty].forEach((field) => {
        if (!field) {
            throw new ApiError(400, "All fields are required");
        }
    });

    if (!user) {
       throw new ApiError(404,"user not Found");
    }

    if (user.isVerified === false || user.role !== "admin") {
        throw new ApiError(400,"user not verified")
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
            throw new ApiError(500, "Error uploading video");
        }
    }

    try {
        const practice = await Practice.create({
            title,
            instruction,
            image:uploadedImage?.secure_url,
            video:uploadedVideo?.secure_url,
            xp,
            tags,
            difficulty
        });


        return NextResponse.
            json({
                message: "Practice created successfully",
                practice
            },
                {
                    status: 201
                });
    } catch (error:unknown) {
        console.error("Error creating practice:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error creating practice"

            }, {
                status: error instanceof ApiError ? error.statusCode : 500

            });
    }
}