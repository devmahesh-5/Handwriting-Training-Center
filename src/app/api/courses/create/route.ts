//search to do
import Courses from "@/models/course.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
import { saveBuffer } from "@/utils/saveBuffer";
import uploadOnCloudinary from "@/helpers/cloudinary";


connectDB();
export async function POST(req: NextRequest) {
    try {
        const user = await getDataFromToken(req);

        const formData = await req.formData();

        const courseImage = formData.get('thumbnail') as File;

        const body = Object.fromEntries(formData) as {
            name: string;
            description: string;
            type: string;
            price: string;
            duration: string;
            tags ?: string;
        };


        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }

        if (user.isVerified === false || user.role !== "Admin") {
            throw new ApiError(401, "User is not Authorized to create course");
        }

        const { name, description, type, price, duration, tags } = body;

        if ([name, description, type, price, duration, tags].some(field => !field || field === undefined)) {
            throw new ApiError(400, "All fields are required");
        }

        const localFile = await saveBuffer(courseImage);
        const uploadedFile = await uploadOnCloudinary(localFile);

        if (!uploadedFile) {
            throw new ApiError(500, "Failed to upload course image");
        }


        const course = await Courses.create({
            name,
            description,
            type,
            price,
            duration,
            thumbnail: uploadedFile.secure_url,
            tags,
        });

        if (!course) {
            throw new ApiError(500, "Course not created");
        }

        return NextResponse.
            json({
                message: "Course created successfully",
                course
            }, {
                status: 201
            });
    } catch (error: unknown) {
        console.error("Error creating course:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error creating course"
            }, {
                status: error instanceof ApiError ? error.statusCode : 500
            });
    }
}