import PracticeSet from "@/models/practiceSet.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "@/utils/ApiError";

connectDB();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!isValidObjectId(id)) {
            throw new ApiError(404, "invalid practice set id");
        }
        const practiceSet = await PracticeSet.aggregate([
            {
                $match: {
                    _id: id
                }
            },
            {
                $lookup: {
                    from: "practiceentrys",
                    localField: "practiceEntry",
                    foreignField: "_id",
                    as: "practiceEntry",
                    pipeline: [
                        {
                            $lookup: {
                                from: "practices",
                                localField: "practice",
                                foreignField: "_id",
                                as: "practice"
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "course",
                    foreignField: "_id",
                    as: "course",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                thumbnail: 1
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    practiceEntry: 1,
                    course: 1,
                    title: 1,
                    discription: 1,
                    _id: 1,
                    updated_at: 1
                }
            }
        ])

        if (!practiceSet.length) {
            throw new ApiError(404, "no practice set found");
        }

        return NextResponse
            .json({
                message: "successfully fetched practice set",
                practiceSet
            },
                {
                    status: 200
                });

    } catch (error: unknown) {

        return NextResponse
            .json(
                {
                    message: error instanceof ApiError ? error.message : "Error getting practice set",
                },
                {
                    status: error instanceof ApiError ? error.statusCode : 500
                }
            )
    }
}

