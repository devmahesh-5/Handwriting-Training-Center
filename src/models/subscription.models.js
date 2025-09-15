import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    classroom: {//it will be assigned by admin later after verification
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
    },
    paymentProof:{
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Subscribed', 'Failed'],
        default: 'Pending',
        required: true,
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true
    }
   
}, {
    timestamps: true
});

subscriptionSchema.index({ student: 1, classroom: 1 }, { background: true });

const Subscription =  mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
export default Subscription