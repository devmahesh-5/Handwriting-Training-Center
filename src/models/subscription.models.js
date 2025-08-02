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
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
    },
    status: {
        type: String,
        enum: ['pending', 'subscribed', 'failed'],
        default: 'pending',
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