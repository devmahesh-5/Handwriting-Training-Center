import mongoose from "mongoose";
import Messages from "@/models/message.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
connectDB();


export async function GET(request: NextRequest) {
    try {
        const user = await getDataFromToken(request);
        if (!user) {
            return NextResponse.json({ message: "user Session expired or not logged in" }, { status: 401 });
        }
        if(user.isVerified===false){
            return NextResponse.json({ message: "User is not verified" }, { status: 401 });
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
                    $group:{
                        _id:"$sender",

                    }
                },
                {
                    $count: "unreadMessages",
                },
            ]
        )
        return NextResponse.json({ message: "Messages fetched successfully", unreadMessageCount }, { status: 200 });
    } catch (error) {
        console.error("Error getting messages:", error);
        return NextResponse.json({ message: "Error getting messages" }, { status: 500 });
    }
}


