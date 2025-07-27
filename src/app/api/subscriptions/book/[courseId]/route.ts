import mongoose,{isValidObjectId} from 'mongoose'
import { ApiError } from '@/utils/ApiError'
import connectDB from '@/db/index'
import { NextRequest,NextResponse } from 'next/server'
import getDataFromToken from '@/helpers/checkAuth';
import User from '@/models/users.models';
import Subscription from '@/models/subscription.models';

connectDB();


export const POST = async(req:NextRequest,{params}:{params: Promise<{courseId:string}> })=>{
    try {
        const {courseId} = await params;
        
        if(!isValidObjectId(courseId)){
            throw new ApiError(400,"Invalid course id")
        }

        const {_id:userId} = await getDataFromToken(req);

        //first book then redirect to payment page(qr payment) after that do create payment model and add payment id to the subscription with student id

        if(!isValidObjectId(userId)){
            throw new ApiError(404,"user not found");
        }

        const user = await User.findById(userId);

        if(user.isVerified ===false){
            throw new ApiError(401,"User not Verified");
        }

        if(user.role != 'Student' ){
            throw new ApiError(401,"only student can subscribe to the plan")
        }

        const subscription = await Subscription.create({
            student: user._id,
            course:courseId,
        })//payment id and the classroom will be assigned later.

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