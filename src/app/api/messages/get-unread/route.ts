import mongoose from "mongoose";
import Messages from "@/models/message.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
connectDB();


export async function GET(request: NextRequest) {
    try {
        const user = await getDataFromToken(request);
        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }

        const unreadMessageCount = await Messages.aggregate(
            [
                {
                    $match: {
                        receiver: new mongoose.Types.ObjectId(user._id),
                        isRead: false,
                    },
                },
                {
                    $group: {
                        _id: "$sender",

                    }
                },
                {
                    $count: "unreadMessages",
                },
            ]
        )
        return NextResponse.
            json({
                message: "Messages fetched successfully",
                unreadMessageCount
            }, {
                status: 200
            });

    } catch (error: unknown) {
        console.error("Error getting messages:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error getting messages"
            }, {
                status: error instanceof ApiError ? error.statusCode : 500 
            });
    }
}


