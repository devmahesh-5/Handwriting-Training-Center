import mongoose from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/db/index";
import Classroom from "@/models/classroom.models";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";

connectDB();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getDataFromToken(req);
        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }

        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }

        const classroom = await Classroom.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(params.id)
                    }
                },
                { 
                    $lookup:{
                        from:"users",
                        localField:"students",
                        foreignField:"_id",
                        as:"students"
                    }
                },
                {
                    $lookup:{
                        from:"users",
                        localField:"teacher",
                        foreignField:"_id",
                        as:"teacher"
                    }
                },
                {
                    $lookup:{
                        from:"courses",
                        localField:"course",
                        foreignField:"_id",
                        as:"course"
                    }
                },
                {
                    $lookup:{
                        from:"payments",
                        localField:"payment",
                        foreignField:"_id",
                        as:"payment"
                    }
                },
                {
                    $lookup:{
                        from:"subscriptions",
                        localField:"subscription",
                        foreignField:"_id",
                        as:"subscription"
                    }
                }
            ]
        )

        return NextResponse.
            json({
                message: "Classroom fetched successfully",
                classroom
            }, {
                status: 200
            });

    } catch (error: unknown) {
        console.error("Error creating classroom:", error);
        return NextResponse.json({ message: error instanceof ApiError ? error.message : "Error creating classroom" }, { status: error instanceof ApiError ? error.statusCode : 500 });

    }
}
