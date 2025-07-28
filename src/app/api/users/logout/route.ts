import mongoose from "mongoose";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import User from "@/models/users.models";
import { ApiError } from "@/utils/ApiError";
import connectDB from "@/db/index";
import getDataFromToken from "@/helpers/checkAuth";


connectDB();

export async function POST(req: NextRequest) {
    try {
        const user = await getDataFromToken(req);

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }

        const response = NextResponse.json(
            {
                message: "User logged out successfully"
            },
            {
                status: 200
            }
        )

        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        return response;
        
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json(
            { 
                message: error instanceof ApiError ? error.message : "Error logging out"
             },
             { 
                status:error instanceof ApiError ? error.statusCode :500 
            });
    }

}