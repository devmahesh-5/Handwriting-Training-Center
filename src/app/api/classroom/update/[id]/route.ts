import mongoose from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/db/index";
import Classroom from "@/models/classroom.models";
connectDB();

export async function PATCH(req: NextRequest,{params}:{params:{id:string}}) {
    try {
        const id = params.id;
        const { teacher,status } = await req.json();
        const classroom = await Classroom.findByIdAndUpdate(
            id,
            {
                $set: {
                    teacher,
                    status
                },
            },
            { new: true }
        )
        return NextResponse.json({ message: "Classroom updated successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error creating classroom:", error);
        return NextResponse.json({ message: "Error creating classroom" }, { status: 500 });
    }
}
