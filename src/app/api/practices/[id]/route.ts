//get update delete
import mongoose from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/db/index";
import Practice from "@/models/practice.models";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";

connectDB();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const practice = await Practice.findById(id);
        if (!practice) {
            throw new ApiError(404, "Practice not found");
        }
        return NextResponse.json({
            message: "Practice found successfully",
            practice,
        },
    {
        status: 200
    });
    } catch (error:unknown) {
        return NextResponse.json(
            {
                message: error instanceof ApiError ? error.message : "Error getting practice",
            },
            {
                status: error instanceof ApiError ? error.statusCode : 500
            }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getDataFromToken(req);

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        const {id} = await params;
        const practice = await Practice.findByIdAndDelete(id);
        if (!practice) {
            throw new ApiError(404, "Practice not found");
        }
        return NextResponse.json({
            message: "Practice deleted successfully",
            practice,
        },
    {
        status: 200
    });
    } catch (error:unknown) {
        return NextResponse.json(
            {
                message: error instanceof ApiError ? error.message : "Error deleting practice",
            },
            {
                status: error instanceof ApiError ? error.statusCode : 500
            });
        }
}

//needs to review
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await req.json();
        const user = await getDataFromToken(req);

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        
        const {id} = await params;

        if(user.isVerified === false || user.role !== "admin") {
            throw new ApiError(401, "User is authorized to update practice");
        }
        const practice = await Practice.findByIdAndUpdate(
            id,
            { $set:
                {
                    ...body
                }
            }, 
            { new: true });
        if (!practice) {
            throw new ApiError(404, "Practice not found");
        }
        return NextResponse.json({
            message: "Practice updated successfully",
            practice,
        },
    {
        status: 200
    });
    } catch (error:unknown) {
        return NextResponse.json(
            {
                message: error instanceof ApiError ? error.message : "Error updating practice",
            },
            {
                status: error instanceof ApiError ? error.statusCode : 500
            });
        }
}
