import User from '../models/User.model';
import * as myJs from '../libs/myFunctions';


export const getUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
}

export const getUserById = async (req, res) => {
    const users = await User.findById(req.params.postId);
    res.json(users);
}

export const getUserByName = async (req, res) => {
    
    var string = req.query.username.trim();

    if(string != '' && string != null && string != undefined){
        let normalizedString = myJs.removeAccents(string);
        const users = await User.find({ username: {$regex: normalizedString, $options: 'i'} }).collation({locale: "en", strength: 1});
        let finalUser = [];
        for(let r of users){
            finalUser.push({
                username: r.username, 
                id: r.id
            });
        }
        res.json(finalUser);
    }else{
        res.status(400).json({msg: 'Search not valid '});
    }
    
}

