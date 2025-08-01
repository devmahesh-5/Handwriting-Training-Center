import mongoose from "mongoose";
const practiceEntrySchema = new mongoose.Schema(
  {
    practice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Practice',
      required: true
    },
    status: {
      type: String,
      enum:["locked","active","completed"],
      default:"locked"
    },
    day: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    }
  },
  {timestamps:true} 
);

const practiceEntry = mongoose.models.PracticeEntry || mongoose.model("PracticeEntry",practiceEntrySchema)

export default practiceEntry


//practice entry  this is the entry for the practice set with day
//jaba admin ley practice entry create garxa teti bela chai 
//practice set -->this is practice set for each course
// practice -->this is a dedicated practice for each practice entry
// student practice --> this is the student practice solution for each practice