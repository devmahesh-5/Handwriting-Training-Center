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
        
        if(!classroom){
            throw new ApiError(500,"could not create classroom")
        }
        
        return NextResponse.json(classroom);
        
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}