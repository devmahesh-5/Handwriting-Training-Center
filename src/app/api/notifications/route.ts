import Notification from "@/models/notification.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
connectDB();

export async function GET(request: NextRequest) {
    try {
        const user = await getDataFromToken(request);
        if (!user) {
            return NextResponse.json({ message: "Unauthenticated User" }, { status: 401 });
        }
    if(user.isVerified===false){
        return NextResponse.json({ message: "User is not verified" }, { status: 401 });
    }
        const notifications = await Notification.find({ receiver: user._id });
        return NextResponse.json({ message: "Notifications fetched successfully", notifications }, { status: 200 });
    } catch (error) {
        console.error("Error getting notifications:", error);
        return NextResponse.json({ message: "Error getting notifications" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getDataFromToken(request);
        if (!user) {
            return NextResponse.json({ message: "Unauthenticated User" }, { status: 401 });
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

        return NextResponse.
            json({
                message: "Notifications updated successfully",
                notifications
            }, {
                status: 200
            });
    } catch (error) {
        console.error("Error getting notifications:", error);
        return NextResponse.json({ message: "Error getting notifications" }, { status: 500 });
    }
}