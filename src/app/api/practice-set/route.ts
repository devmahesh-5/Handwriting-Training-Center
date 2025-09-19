import mongoose, { isValidObjectId } from "mongoose";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import PracticeSet from "@/models/practiceSet.models";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
import User from "@/models/users.models";
connectDB();


export async function POST(req: NextRequest) {

    try {
        const { _id } = await getDataFromToken(req);

        const { title, description } = await req.json();

        if (!isValidObjectId(_id)) {
            throw new ApiError(404, "user not Authenticated")
        }

        const user = await User.findById(_id);

        if (!user) {
            throw new ApiError(404, "User not found")
        }

        if (user.isVerified === false || user.role !== "Admin") {
            throw new ApiError(400, "User not authorized to make practice set")
        }

        const practiceSet = await PracticeSet.create({ title, description });
        
        return NextResponse.
            json({
                message: "practice set created successfully",
                practiceSet
            },
                {
                    status: 201

                });

    } catch (error: unknown) {

        console.error("Error creating practice set:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError? error.message :"Error creating practice set"

            },
                {
                    status: error instanceof ApiError? error.statusCode :500
                });
    }

}

export async function GET(req: NextRequest) {
    try {
        const { _id } = await getDataFromToken(req);

        if (!isValidObjectId(_id)) {
            throw new ApiError(404, "user not Authenticated")
        }
        
        const practiceSets = await PracticeSet.find({});

        if(!practiceSets){
            throw new ApiError(404, "No practice sets found");
        }

        return NextResponse.json({ message: "Practice sets found successfully", practiceSets }, { status: 200 });
    } catch (error: unknown) {
        console.error("Error getting practice sets:", error);
        return NextResponse.json({ message: error instanceof ApiError ? error.message : "Error getting practice sets" }, { status: error instanceof ApiError ? error.statusCode : 500 });
    }
}


