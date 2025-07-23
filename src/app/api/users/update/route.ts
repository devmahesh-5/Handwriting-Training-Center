import User from "@/models/users.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import mongoose, { isValidObjectId } from "mongoose";
import { saveBuffer } from "@/utils/saveBuffer";
import uploadOnCloudinary from "@/helpers/cloudinary";
import { ApiError } from "@/utils/ApiError";

connectDB();

export async function PATCH(request: NextRequest) {
    try {
        const user = await getDataFromToken(request);

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }

        const formData = await request.formData();
        const profilePicture = formData.get('profilePicture') as File;
        const fullName = formData.get('fullName') as string;
        const email = formData.get('email') as string;
        const role = formData.get('role') as string;
        const phone = formData.get('phone') as string;
        const gender = formData.get('gender') as string;
        if ([fullName, email, role, phone, gender].some(field => !field)) {
            throw new ApiError(400, "All fields are required");
        }

        // Configure Cloudinary
        let uploadedProfile = null;
        const olderProfilePicture = user?.profilePicture;

        if (profilePicture) {
            const tempFilePath = await saveBuffer(profilePicture);
            uploadedProfile = await uploadOnCloudinary(tempFilePath);
            if (!uploadedProfile) {
                throw new ApiError(500, "Failed to upload profile picture");
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    fullName,
                    email,
                    role,
                    phone,
                    gender,
                    profilePicture: uploadedProfile?.secure_url || olderProfilePicture
                },
            },
            { new: true }
        )

        if (!updatedUser) {
            throw new ApiError(404, "User not found");
        }

        return NextResponse.
            json(
                {
                    message: "User registered successfully",
                    updatedUser
                }
                , {
                    status: 201
                });

    } catch (error: unknown) {
        return NextResponse.json(
            {
                message: error instanceof ApiError ? error.message : "Something went wrong"
            }
            , {
                status: error instanceof ApiError ? error.statusCode : 500
            });
    }
}