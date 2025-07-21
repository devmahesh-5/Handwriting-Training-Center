import Courses from "@/models/course.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import getDataFromToken from "@/helpers/checkAuth";
connectDB();

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }){
    try {
        const id = params.id;
        const user = await getDataFromToken(req);
        if(!user){
            throw new Error("User Session expired or not logged in");
        }

        if(user.isVerified===false){
            throw new Error("User is not verified");
        }

        await Courses.findByIdAndDelete(id);
        return NextResponse.json({ message: "Course deleted successfully" }, { status: 200 });
    } catch (error:any) {
        console.error("Error deleting course:", error);
        return NextResponse.json({ message: error.message || "Error deleting course" }, { status: 500 });
    }
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getDataFromToken(req);
        if(!user){
            throw new Error("User Session expired or not logged in");
        }
        if(user.isVerified===false){
            throw new Error("User is not verified");
        }

        if (!isValidObjectId(params.id)) return NextResponse.json(
            { message: "Invalid course ID" },
            { status: 400 });

        const course = Courses.aggregate(
            [
                {
                    $match: {
                        _id: params.id
                    }
                },

                {
                    $lookup: {
                        from: "users",
                        localField: "teacher",
                        foreignField: "_id",
                        as: "teacher",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    email: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup:{
                        from:"practicesets",
                        localField:"practiceSet",
                        foreignField:"_id",
                        as:"practiceset"
                    }
                },
                {
                    $addFields: {
                        teacher:{
                            $first:"$teacher"
                        }
                    }
                }

            ]
        )
        return NextResponse.
            json(
                {
                    message:
                        "Course fetched successfully",
                    course
                },
                {
                    status: 200

                });
        
    } catch (error: any) {
        console.error("Error creating course:", error);
        return NextResponse.json({ message: error.message || "Error creating course" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getDataFromToken(req);
        if (!user) {
            
            throw new Error("User Session expired or not logged in");
        }
        if(user.isVerified===false){
            throw new Error("User is not verified");
        }

        const id = params.id;
        const body = await req.json();
        const { name, description, type, price, duration } = body;
        [name, description, type, price, duration].some(field => !field || field === undefined) && NextResponse.json({ message: "All fields are required" }, { status: 400 });

        const course = await Courses.findByIdAndUpdate(id, {
            name,
            description,
            type,
            price,
            duration
        }, {
            new: true
        });

        return NextResponse.
            json({
                message: "Course updated successfully",
                course

            },
                {
                    status: 200
                });
    } catch (error: any) {
        console.error("Error updating course:", error);
        return NextResponse.json({ message: error.message || "Error updating course" }, { status: 500 });
    }
}
