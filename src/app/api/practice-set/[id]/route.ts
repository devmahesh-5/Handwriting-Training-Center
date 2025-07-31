import PracticeSet from "@/models/practiceSet.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "@/utils/ApiError";

connectDB();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id} = await params;

        if (!isValidObjectId(id)) {
            throw new ApiError(404, "invalid practice set id");
        }

        const practiceSet = await PracticeSet.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
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

// export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string, practiceEntryId: string }> }) {
//     try {

//         const { _id: userId,practiceEntryId } = await getDataFromToken(req);
//         const { id } = await params;
//         if (!isValidObjectId(userId)) {
//             throw new ApiError(404, "user not Authenticated")
//         }

//         if(!isValidObjectId(practiceEntryId)){
//             throw new ApiError(404,"practice entry not found")
//         }

//         const practiceSet = await PracticeSet.findByIdAndUpdate(
//             id,
//             {
//                 $addToSet: {
//                     practiceEntry: practiceEntryId
//                 }
//             },
//             {
//                 new: true
//             }
//         )

//         if (!practiceSet) {
//             throw new ApiError(404, "no practice set found");
//         }

//         return NextResponse
//             .json({
//                 message: "successfully updated practice set",
//                 practiceSet
//             },
//                 {
//                     status: 200
//                 });
        
//     } catch (error: unknown) {
//         if(error instanceof ApiError) {
//             return NextResponse
//             .json(
//                 {
//                     message: error.message,
//                 },
//                 {
//                     status: error.statusCode
//                 }
//             )
//         }else{

//             return NextResponse
//             .json(
//                 {
//                     message: "Something went wrong while updating practice set",
//                 },
//                 {
//                     status: 500
//                 }
//             )
//         }
//     }
// }