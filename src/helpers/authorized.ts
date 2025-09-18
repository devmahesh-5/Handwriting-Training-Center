import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import connectDB from "@/db/index";
import getDataFromToken from "@/helpers/checkAuth";
import { User } from "@/interfaces/interfaces";
connectDB();

export default function checkAuthorization (user:User,req:NextRequest) {
    if(user.isVerified===false){
        throw new Error("User is not verified");
    }else{
        return true;
    }

}