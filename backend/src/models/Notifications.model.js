import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
    type: String,
    emiterUserId: String,
    emiterUsername: String,
    receiveUserId: String,
    receiveUsername: String,
    description: String
}, {
    timestamps: true,
    versionKey: false
});


export default model('Notifications', notificationSchema);