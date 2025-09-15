import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '@/utils/ApiError';



// let uploadedProfile = null;
//         if (profilePicture) {
//             const buffer = Buffer.from(await profilePicture.arrayBuffer());
//             const tempFilePath = path.join(process.cwd(), "temp_" + uuidv4() + profilePicture.name);
//             fs.writeFileSync(tempFilePath, buffer);
//             uploadedProfile = await uploadOnCloudinary(tempFilePath);
//             if (!uploadedProfile) {
//                 throw new ApiError(500, "Failed to upload profile picture");
//             }
//         }

export const saveBuffer = async(inputFile: File) => {
    try {
        // if (!inputFile || !(inputFile instanceof File)) {
        //     throw new ApiError(404, "Invalid input file");
        // }
        const buffer = Buffer.from(await inputFile.arrayBuffer());
        const tempFilePath = path.join(process.cwd(), "temp_"+uuidv4() + inputFile.name);
        fs.writeFileSync(tempFilePath, buffer);
        return tempFilePath;
    } catch (error: unknown) {
        console.error("Error saving buffer:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        
        throw new ApiError(500, "Failed to save buffer");
    }
}

