import Practice from "@/models/practice.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import mongoose, { isValidObjectId } from "mongoose";
import PracticeSet from "@/models/practiceSet.models";
import { ApiError } from "@/utils/ApiError";

connectDB();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string, practiceEntryId: string }> }) {
    try {

        const { _id: userId } = await getDataFromToken(req);
        const { id, practiceEntryId } = await params;
        if (!isValidObjectId(userId)) {
            throw new ApiError(404, "user not Authenticated")
        }

        const updatedPracticeSet = await PracticeSet.findByIdAndUpdate(
            id,
            {
                $addToSet: {
                    practiceEntry: practiceEntryId
                }
            }
        )

        if (!updatedPracticeSet) {
            throw new ApiError(404, "no practice set found");
        }

        return NextResponse.json(
            {
                message: "Updated practice set successfully",
                updatedPracticeSet
            },
            {
                status: 200
            });

    } catch (error: unknown) {

        console.error("Error addign practice entry:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error adding practice entry on practice set"

            },
                {
                    status: error instanceof ApiError ? error.statusCode : 500
                });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string, practiceEntryId: string }> }){
    try {
        const { _id: userId } = await getDataFromToken(req);

        const { id, practiceEntryId } = await params;

        if (!isValidObjectId(userId)) {
            throw new ApiError(404, "user not Authenticated")
        }

        if(!isValidObjectId(practiceEntryId) || !isValidObjectId(id)){
            throw new ApiError(404, "invalid practice entry or practice set id");
        }

        const updatedPracticeSet = await PracticeSet.updateOne(
            {
                _id: id
            },
            {
                $pull: {
                    practiceEntry: practiceEntryId
                }
            }
        )

        if (updatedPracticeSet.modifiedCount === 0) {
            throw new ApiError(404, "Practice entry not found in practice set");
        }

        return NextResponse.json(
            {
                message: "removed entry from practice set successfully",
                updatedPracticeSet
            },
            {
                status: 200
            });

    } catch (error: unknown) {
        
        console.error("Error removing practice entry:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error adding practice entry on practice set"
            },
                {
                    status: error instanceof ApiError ? error.statusCode : 500
                });
    }
}