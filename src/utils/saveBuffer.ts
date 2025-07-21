import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const saveBuffer = async(inputFile: File) => {
    try {
        const buffer = Buffer.from(await inputFile.arrayBuffer());
        const tempFilePath = path.join(process.cwd(), "temp_"+uuidv4() + inputFile.name);
        fs.writeFileSync(tempFilePath, buffer);
        return tempFilePath;
    } catch (error) {
        console.error("Error saving buffer:", error);
        throw new Error("Failed to save buffer: " + error);
    }
}

