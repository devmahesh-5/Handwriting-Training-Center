import Notification from "@/models/notification.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import { isValidObjectId } from "mongoose";
import User from "@/models/users.models";
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
        const notifications = await Notification.find({ receiver: user._id });

        if (!notifications) {
            throw new ApiError(404, "Notifications not found");
        }

        return NextResponse.
            json({
                message: "Notifications fetched successfully",
                notifications
            }, {
                status: 200
            });

    } catch (error: unknown) {
        console.error("Error getting notifications:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error getting notifications"
            }, { status: error instanceof ApiError ? error.statusCode : 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getDataFromToken(request);
        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        const notifications = await Notification.updateMany(
            { receiver: user._id },
            {
                $set: {
                    isRead: true
                }
            },
            {
                new: true
            }
        )

        if (!notifications) {
            throw new ApiError(404, "Notifications not found");
        }

        return NextResponse.
            json({
                message: "Notifications updated successfully",
                notifications
            }, {
                status: 200
            });
    } catch (error: unknown) {
        console.error("Error getting notifications:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error getting notifications"
            }, { status: error instanceof ApiError ? error.statusCode : 500 });
    }
}