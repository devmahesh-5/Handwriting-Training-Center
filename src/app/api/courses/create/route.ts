import Courses from "@/models/course.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";

connectDB();
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
         const user = await getDataFromToken(req);
        if (!user) {
            
            throw new Error("User Session expired or not logged in");
        }
        if(user.isVerified===false){
            throw new Error("User is not verified");
        }

        
        const {name,description,type,price,duration} = body;
        [name,description,type,price,duration].some(field => !field || field ===undefined) && NextResponse.json({ message: "All fields are required" }, { status: 400 });
        const course = await Courses.create({name,description,type,price,duration});
        return NextResponse.json({ message: "Course created successfully", course }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating course:", error);
        return NextResponse.json({ message: error.message || "Error creating course"  }, { status: 500 });
    }
}