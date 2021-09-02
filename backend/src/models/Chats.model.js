import { Schema, model } from 'mongoose';

const chatSchema = new Schema({
    members: [],
    messages: [{
        msg: String,
        emiterUserId: String,
        emiterUsername: String,
        receiveUserId: String,
        receiveUsername: String,
        createdAt: Date,
        isReaded: Boolean
    }],
    typeChat: String
}, {
    timestamps: true,
    versionKey: false
});


export default model('Chats', chatSchema);