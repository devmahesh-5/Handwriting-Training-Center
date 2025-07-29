import mongoose from "mongoose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/db/index";
import Classroom from "@/models/classroom.models";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";

connectDB();

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const user = await getDataFromToken(req);
        const classroom = await Classroom.create({
            ...data,
            teacher: user._id,
        });
        return NextResponse.json(classroom);
    } catch (error: any) {
        throw new ApiError(500, error.message);
    }
}