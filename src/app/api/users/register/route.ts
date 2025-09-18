import mongoose from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/db/index";
import User from "@/models/users.models";
import uploadOnCloudinary from "@/helpers/cloudinary";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from "@/utils/ApiError";
connectDB();

export async function POST(request: NextRequest) {

    try {
        const formData = await request.formData();
        const profilePicture = formData.get('profilePicture') as File;
        const fullName = formData.get('fullName') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const username = formData.get('username') as string;
        const role = formData.get('role') as string;
        const phone = formData.get('phone') as string;
        const gender = formData.get('gender') as string;
        const skills = formData.getAll('skills') as string[];
        if ([fullName, email, password, username, role, phone, gender].some(field => !field)) {
            throw new ApiError(400, "All fields are required");
        }

        const existingUser = await mongoose.models.User.findOne({ email });
        if (existingUser) {
            throw new ApiError(400, "User already exists");
        }
        // Configure Cloudinary
        let uploadedProfile = null;
        if (profilePicture) {
            const buffer = Buffer.from(await profilePicture.arrayBuffer());
            const tempFilePath = path.join(process.cwd(), "temp_" + uuidv4() + profilePicture.name);
            fs.writeFileSync(tempFilePath, buffer);
            uploadedProfile = await uploadOnCloudinary(tempFilePath);
            if (!uploadedProfile) {
                throw new ApiError(500, "Failed to upload profile picture");
            }
        }

        const newUser = new User({
            fullName,
            email,
            password,
            username,
            role,
            phone,
            gender,
            profilePicture: uploadedProfile?.secure_url || null,
            skills
        });
        await newUser.save();
        return NextResponse.json(
            { message: "User registered successfully" }
            , { status: 201 });

    } catch (error: unknown) {
        console.error("Error registering user:", error);
        return NextResponse.json(
            {
                message:
                    error instanceof ApiError ? error.message : "Error registering user"
            }
            , {
                status:
                    error instanceof ApiError ? error.statusCode : 500
            });
    }

}