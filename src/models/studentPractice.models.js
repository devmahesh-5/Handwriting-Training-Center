// models/studentPractice.model.ts
import mongoose from "mongoose";

const studentSolutionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // students are in User model
    required: true,
  },
  practice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Practice",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "checked",'redo'],
    default: "pending",
  },
  submissionFile: {
    type: String
  },
  feedback: {
    type: String
  },
  marks: {
    type: Number
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true,
  }
}, {
  timestamps: true
});

const StudentSolution = mongoose.models.StudentSolution || mongoose.model("StudentSolution", studentSolutionSchema);
export default StudentSolution;
