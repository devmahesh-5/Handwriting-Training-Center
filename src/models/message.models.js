import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomId: {
        type: String,
        required: true
    },
    message: {
        type: String,
    },
    messageFiles:[
        {
            type : String
        }
    ]
},{timestamps : true});

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message