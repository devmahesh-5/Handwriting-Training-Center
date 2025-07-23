import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/db/index";
import User from "@/models/users.models.js";
import getDataFromToken from "@/helpers/checkAuth"
import { ApiError } from "@/utils/ApiError";
connectDB();

export async function GET(request: NextRequest) {
    try {


        const user = await getDataFromToken(request);

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        const response = NextResponse.json({
            message: "User profile fetched successfully",
            data: user
        }, { status: 200 });

        return response;

    } catch (error: any) {
        console.error("Error getting user ID from token:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error getting user ID from token"
            }, {
                status: error instanceof ApiError ? error.statusCode : 500
            });
    }

}