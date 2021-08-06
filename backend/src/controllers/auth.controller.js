import User from '../models/User.model';
import jwt from 'jsonwebtoken';
import config from '../config';
import Role from '../models/Role.model';


export const signUp = async (req, res) => {

    const { username, email, password, roles} = req.body;

    const userFound = await User.findOne({ email: email });
    if(userFound){return res.status(401).json({message: 'User already exists.'})};

    const newUser = new User({
        username,
        email,
        password: await User.encryptPassword(password),
        profileImg: '',
        likes: 0,
        views: 0
    });

    if(roles){
        const foundedRoles = await Role.find({name: {$in: roles }}); //Comprueba si existen algunos de los roles recibidos en la peticion
        newUser.roles = foundedRoles.map( role =>  role._id); //Solo guarda en el user el id de los roles
    }else{
        const role = await Role.findOne({name: 'user'});
        newUser.roles = [role._id];
    }

    const savedUser = await newUser.save();//Guardamos/Registramos usuario.

    //Generamos un token para que el frontend pueda interactuar con el backend "con permiso".
    //Se le pasa el id generado por mongo al registrar / una palabra clave declarada en el archivo config.js / opciones-conf del token
    const token = await jwt.sign({id: savedUser._id}, config.SECRET, {
        expiresIn: 86400 //24h de duración del token valido
    });

    res.json({token:token});
}


export const signIn = async (req, res) => {
    
    const userFound = await User.findOne({ email: req.body.email }).populate("roles"); //populate() hace que devuelva el objeto de roles entero y no solo su Id
    if(!userFound){return res.status(400).json({message: 'User not found'})}

    const matchPassword = await User.comparePassword(req.body.password, userFound.password);
    if(!matchPassword) return res.status(401).json({token:null, message: 'Invalid password'});

    const token = jwt.sign({id: userFound._id}, config.SECRET, {
        expiresIn: 86400 //24h de duración del token valido
    });
    console.log(userFound);
    res.json({token: token});
}

export const checkToken = async (req, res) => {
    res.json(true);
}

const getUserId = ( async (token) => {
    const decoded = await jwt.verify(token, config.SECRET);
    return decoded.id;
});

export const currentUser = async (req, res) => {
    const token = req.headers["x-access-token"];
    if(!token) return res.status(403).json({message:"No token provided."});

    const userId = await getUserId(token);
    const user = await User.findById(userId);
    if(!user) return res.status(404).json({message: 'User not found.'});
    console.log("currentUser", user);
    res.json(user);
}