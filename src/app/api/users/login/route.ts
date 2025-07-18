import mongoose from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/db/index";
import User from "@/models/users.models";
import { options } from '@/utils/constant'
import { Session } from "inspector/promises";
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
            return NextResponse.json(
                { message: "All fields are required" }
                , { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { message: "User not registered.please register before logging in" }
                , { status: 404 });
        }

        const isPasswordCorrect = user.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            return NextResponse.json(
                {
                    message: "invalid password"
                },
                {
                    status: 400
                }
            );
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
            return NextResponse.json(
                {
                    message: "something went wrong error while generating tokens"
                },
                {
                    status: 500
                }
            );
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

    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error", error }
            , { status: 500 });
    }

}