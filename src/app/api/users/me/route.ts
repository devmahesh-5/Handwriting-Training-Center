import { NextResponse,NextRequest } from "next/server";
import connectDB from "@/db/index";
import User from "@/models/users.models.js";
import {getDataFromToken} from "@/helpers/checkAuth"
connectDB();

export async function GET(request: NextRequest) {
    try {
        
        
        const user = await getDataFromToken(request);
        
        if(!user){
            return NextResponse.json({message:"user Session expired or not logged in"},{status:400})
        }
        const response = NextResponse.json({
            message: "User profile fetched successfully",
            data:user
        }, { status: 200 });

        return response;

    }catch (error: any) {
        console.error("Error getting user ID from token:", error);
        const statusCode = error.message === "Session not found" || error.message === "User not found"
      ? 401
      : 500;
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

}