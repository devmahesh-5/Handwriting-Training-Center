import mongoose from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/db/index";
import User from "@/models/users.models";
import { ApiError } from "@/utils/ApiError";
connectDB();
// const generateToken=async(user:any)=>{
//     const accessToken = await user.generateAccessToken();
//     const refreshToken = await user.generateRefreshToken();

//     if(!accessToken || !refreshToken){
//         return NextResponse.json(
//             {
//                 message:"could not generate tokens"
//             },
//             {
//                 status:500
//             }
//         );
//     }

// }
export async function POST(request: NextRequest) {

    try {
        const { email, password } = await request.json();
        if ([email, password].some(field => !field)) {
            throw new ApiError(400, "All fields are required");
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const isPasswordCorrect = await user.isPasswordCorrect(password);

        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid password");
        }
        const userUpdated = await User.findByIdAndUpdate(user._id, {
            $set: {
                sessionId: new Date().getTime()
            }
        }, {
            new: true
        }
        );
        const newUser = await User.findById(user._id).select("-password -__v");
        const accessToken = await newUser.generateAccessToken();
        const refreshToken = await newUser.generateRefreshToken();

        if (!accessToken || !refreshToken) {
            throw new ApiError(500, "Could not generate tokens");
        }

        const response = NextResponse.json(
            {
                message: "Login successful",
                success: true,
                status: 201
            }
        );
        response.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 1 day
        });
        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 1 day
        });

        return response;

    } catch (error: unknown) {
        return NextResponse.
            json(
                {
                    message: error instanceof ApiError ? error.message : "Something went wrong"
                }
                , {
                    status: error instanceof ApiError ? error.statusCode : 500
                });
    }

}