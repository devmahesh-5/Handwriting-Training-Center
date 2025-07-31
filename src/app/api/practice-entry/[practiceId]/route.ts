import mongoose, { isValidObjectId } from "mongoose";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
import PracticeEntry from "@/models/practiceEntry.models";
import { log } from "console";
connectDB();

export async function POST(request: NextRequest, { params }: { params: Promise<{ practiceId: string }> }) {
    try {
        
        const {day, totalMarks} = await request.json();
        const { practiceId } = await params;

        if (!day || !totalMarks || !practiceId) {
            throw new ApiError(400, "All fields are required");
        }

        const { _id } = await getDataFromToken(request);

        if (!_id) {
            throw new ApiError(401, "User Session expired or not logged in");
        }

        if (!isValidObjectId(practiceId)) {
            throw new ApiError(400, "Invalid practice id");
        }

        const practiceEntry = await PracticeEntry.create({
            practice: practiceId,
            day,
            totalMarks
        });

        if(!practiceEntry) {
            throw new ApiError(500, "Something went wrong while creating practice entry");
        }

        return NextResponse.json(
            {
                message: "practice entry created successfully",
                practiceEntry
            },
            {
                status: 201
            }
        );

    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}