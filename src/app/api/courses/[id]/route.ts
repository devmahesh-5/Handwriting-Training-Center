import Courses from "@/models/course.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
import User from "@/models/users.models";
import mongoose,{isValidObjectId} from "mongoose";

connectDB();

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;

        const user = await getDataFromToken(req);
        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }

        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }

        if (user.role !== "admin") throw new ApiError(401, "only admin can delete course");

        if (!isValidObjectId(id)) throw new ApiError(400, "Invalid course ID");

        const course = await Courses.findByIdAndDelete(id);

        if (!course) {
            throw new ApiError(500, "Course not deleted");
        }

        return NextResponse.
            json({
                message: "Course deleted successfully"
            }, {
                status: 200
            });

    } catch (error: unknown) {
        console.error("Error deleting course:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error deleting course"
            }, {
                status: error instanceof ApiError ? error.statusCode : 500
            });
    }
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        
        const user = await getDataFromToken(req);
        if (!user) {
            throw new Error("User Session expired or not logged in");
        }
        if (user.isVerified === false) {
            throw new Error("User is not verified");
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(404, "Invalid course ID");
        }

        const course = await Courses.aggregate(
            [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $lookup: {
                        from: "practicesets",
                        localField: "practiceSet",
                        foreignField: "_id",
                        as: "practiceset"
                    }
                }

            ]
        )

        if(!course) {
            throw new ApiError(404, "Course not found");
        }

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

    } catch (error: unknown) {
        console.error("Error creating course:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error creating course"
            }, {
                status: error instanceof ApiError ? error.statusCode : 500

            });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getDataFromToken(req);
        if (!user) {

            throw new ApiError(401, "User Session expired or not logged in");
        }
        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }

        const id =(await params).id;
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
    } catch (error: unknown) {
        console.error("Error updating course:", error);
        return NextResponse.
        json({
             message: error instanceof ApiError ? error.message : "Error updating course" }, { 
            status: error instanceof ApiError ? error.statusCode : 500
         });
    }
}


