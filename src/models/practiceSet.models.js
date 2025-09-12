import mongoose from "mongoose";

const practiceSetSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        course:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        practiceEntry:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'PracticeEntry'
            }
        ]
        
    },
    {
        timestamps: true
    }
)

const PracticeSet = mongoose.models.PracticeSet || mongoose.model('PracticeSet', practiceSetSchema);
export default PracticeSet

