import mongoose from "mongoose";    
const { Schema } = mongoose;

const whiteboardSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  owner:{
    type: String,
    required: true,
  },
  drawing: {
  type: [Object], // array of strokes
  default: [],
},
  isPasswordProtected :{
    type: Boolean,
    default: false,

  },
  password :{
    type: String,
    required: function() { return this.isPasswordProtected; },
  },
  classroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    default: null,
  },

},{ timestamps: true});

const Whiteboard = mongoose.models.Whiteboard || mongoose.model('Whiteboard', whiteboardSchema);
export default Whiteboard;
