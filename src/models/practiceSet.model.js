import mongoose from "mongoose";
const practiceEntrySchema = new mongoose.Schema(
  {
    practice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Practice',
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum:["locked","active","completed"]
    },
    day: {
      type: Number,
      default: 0,
    },
  },
  {timestamps:true} // Don't generate _id for each entry
);

const practiceEntry = mongoose.models.practiceEntry || mongoose.model("PracticeEntry",practiceEntrySchema)