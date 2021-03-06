import {Schema, model} from 'mongoose';

const postSchema = new Schema({
    title: String,
    category: String,
    imgURL: String,
    description: String,
    propietaryId: String,
    propietaryUsername: String,
    likes: [],
    comments: [{
        comment: String,
        writer: String,
        createdAt: Date
    }]
}, {
    timestamps: true,
    versionKey: false
});

export default model('Post', postSchema);
