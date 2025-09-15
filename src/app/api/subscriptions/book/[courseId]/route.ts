import mongoose,{isValidObjectId} from 'mongoose'
import { ApiError } from '@/utils/ApiError'
import connectDB from '@/db/index'
import { NextRequest,NextResponse } from 'next/server'
import getDataFromToken from '@/helpers/checkAuth';
import User from '@/models/users.models';
import Subscription from '@/models/subscription.models';
import uploadOnCloudinary from '@/helpers/cloudinary';
import { saveBuffer } from '@/utils/saveBuffer';

connectDB();


export const POST = async(req:NextRequest,{params}:{params: Promise<{courseId:string}> })=>{
    try {
        const {courseId} = await params;

        if(!isValidObjectId(courseId)){
            throw new ApiError(400,"Invalid course id")
        }

        const {_id:userId} = await getDataFromToken(req);


        if(!isValidObjectId(userId)){
            throw new ApiError(404,"user not found");
        }

        const user = await User.findById(userId);

        //check it later

        // if(user.isVerified ===false){
        //     throw new ApiError(401,"User not Verified");
        // }

        if(user.role != 'Student' ){
            throw new ApiError(401,"only student can subscribe to the plan")
        }

        const formData = await req.formData();

        if (!formData) {
            throw new ApiError(400, "Submission data is required");
        }

        const paymentProof = formData.get("paymentProof") as File;

        if (!paymentProof) {
            throw new ApiError(400, "Submission file is required");
        }

        const tempFilePath = await saveBuffer(paymentProof);

        if (!tempFilePath) {
            throw new ApiError(500, "Error saving submission file");
        }
        const uploadedpaymentProof = await uploadOnCloudinary(tempFilePath);

        if (!uploadedpaymentProof) {
            throw new ApiError(500, "Error uploading submission file");
        }

        const subscription = await Subscription.create({
            student: user._id,
            course:courseId,
            paymentProof:uploadedpaymentProof.secure_url
        })

        if(!subscription){
            throw new ApiError(500,"something ")
                   }

        return NextResponse.
                    json(
                        {
                            messaage:"Successfully Booked course",
                            subscription
                        },
                        {
                            status:201
                        }
                    )


    } catch (error:unknown) {

        console.error("Error occured: ",error);
        return NextResponse
                        .json(
                            {
                                message: error instanceof ApiError?error.message : "Something went wrong while subcribing the course"
                            },
                            {
                                status:error instanceof ApiError?error.statusCode:500
                            }
                        )
    }
}