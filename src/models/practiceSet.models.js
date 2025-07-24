import mongoose from "mongoose";

const practiceSetSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: true
        },
        discription: {
            type: String,
            required: true
        },
        course:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        practiceEntry:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PracticeEntry',
            required: true
        }
        
    },
    {
        timestamps: true
    }
)

const PracticeSet = mongoose.models.PracticeSet || mongoose.model('PracticeSet', practiceSetSchema);
export default PracticeSet

