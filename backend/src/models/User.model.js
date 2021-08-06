import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
    username: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    roles: [{
        ref: 'Role',
        type: Schema.Types.ObjectId
    }],
    profileImg: String,
    chats: [],
    contacts: [],
    posts: [],
    views: Number,
    likes: Number
}, {
    timestamps: true,
    versionKey: false
});

//Cifrar y comparar contraseñas
userSchema.statics.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);//genSalt es un algoritmo de cifrado, se le pasa el numero de veces que se repetira, en este caso 10.
    return await bcrypt.hash(password, salt);
}

userSchema.statics.comparePassword = async (password, receivedPassword) => {
    return await bcrypt.compare(password, receivedPassword); //Si las contraseñas coinciden retorna true
}


export default model('User', userSchema);