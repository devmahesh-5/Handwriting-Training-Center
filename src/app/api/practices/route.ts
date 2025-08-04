import mongoose from "mongoose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/db/index";
import Practice from "@/models/practice.models";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
import User from "@/models/users.models";

connectDB();

export async function GET(req: NextRequest) {
    try {
        const { _id: userId } = await getDataFromToken(req);

        if (!mongoose.isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(401, "User not authenticated");
        }

        if (user.isVerified === false) {
            throw new ApiError(400, "User is not verified");
        }

        const practices = await Practice.
                                        find({})
                                        .sort({ createdAt: -1 })
                                        

        if (!practices) {
            throw new ApiError(404, "No practices found");
        }


        return NextResponse.json({
            message: "Practices fetched successfully",
            practices
        }, {
            status: 200
        });
        
    } catch (error: unknown) {

        console.error("Error fetching practices:", error);

        if (error instanceof ApiError) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}