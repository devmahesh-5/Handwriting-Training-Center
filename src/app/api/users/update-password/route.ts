import { ApiError } from "@/utils/ApiError";
import User from "@/models/users.models";
import connectDB from "@/db/index";
import { NextRequest,NextResponse } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import { log } from "console";
import { isValidObjectId } from "mongoose";
connectDB();

export async function PATCH(req:NextRequest){
    
    try {
        const {newPassword,oldPassword} = await req.json();
        
        const {_id} = await getDataFromToken(req);

        if(!isValidObjectId(_id)){
            throw new ApiError(400,"user not authenticated");
        }
        const user = await User.findById(_id)

        if(!user){
            throw new ApiError(404,"User not found")
        }

        if(!newPassword?.trim() || !oldPassword.trim() ){
            throw new ApiError(400,"Please first enter required all password")
        }

        const isPassCorrect =await user.isPasswordCorrect(oldPassword);
        
        if(!isPassCorrect){
            throw new ApiError(400,"invalid password ")
        }

        user.password = newPassword;
        await user.save({validateBeforeSave:false})

        return NextResponse.
            json(
                {
                    message:"Successfully updated password"
                },
                {
                    status:201
                }
            )

    } catch (error:unknown) {
        return NextResponse
            .json(
                {
                    message:error instanceof ApiError? error.message :"something went wrong while updating password"
                },
                {
                    status : error instanceof ApiError? error.statusCode:500
                }
            )

    }
}