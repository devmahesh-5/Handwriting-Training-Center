import mongoose from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import Whiteboard from "@/models/whiteboard.models";
import connectDB from "@/db/index";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";

connectDB();

export async function POST(request: NextRequest) {
    try {
        const { _id: userId } = await getDataFromToken(request);
        
        console.log('User ID from token:', userId);
        if (!userId) {
            throw new ApiError(401, 'Unauthorized Access');
        }

        const body = await request.json();
        const { name, owner, isPasswordProtected, password,classroomId } = body;

        if (!name) {
            throw new ApiError(400, 'Name and Owner are required');
        }

        let newWhiteboard = await Whiteboard.findOne({
            classroomId
        })

        if (!newWhiteboard) {
            newWhiteboard = await Whiteboard.create({
            name,
            owner: owner || userId,
            isPasswordProtected: isPasswordProtected || false,
            password: password || null,
            classroomId
            });
        }


        if (!newWhiteboard) {
            throw new ApiError(500, 'Failed to create whiteboard');
        }

        return NextResponse.
            json({
                message: 'Whiteboard created successfully',
                whiteboard: newWhiteboard
            }, {
                status: 201
            });



    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        } else {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }
}

