import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/db/index";
import User from "@/models/users.models.js";
import getDataFromToken from "@/helpers/checkAuth"
import { ApiError } from "@/utils/ApiError";
connectDB();

export async function GET(request: NextRequest) {
    try {
        const { _id: userId } = await getDataFromToken(request);
        if(!userId){
            throw new ApiError(401, "User Session expired or not logged in");
        }
        
        const user = await User.findById(userId).select("-password -sessionId -__v -refreshToken -updatedAt -forgetPasswordToken -forgetPasswordExpiry -verifyToken -verifyTokenExpiry -unVerified_at -verificationAttempts");

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        const response = NextResponse.json({
            message: "User profile fetched successfully",
            user
        }, { status: 200 });

        return response;

    } catch (error: unknown) {
        console.error("Error getting user ID from token:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error getting user ID from token"
            }, {
                status: error instanceof ApiError ? error.statusCode : 500
            });
    }

}