import * as usersCtrl from '../controllers/users.controller';


let socket;
let ioSocket;

let users = [];

//SOCKET.IO CONF
export const connection = (server, whitelist) => {
    const io = require('socket.io')(server, {
        cors: {
            origins: whitelist
        }
    });

    io.on('connection', (newSocket) => {
        console.log("======SOCKET.IO SERVER INICIADO=======");
        socket = newSocket;
        ioSocket = io;

        socket.on('addUserSocketId', (userId) => {
            console.log("SOCKET.IO USUARIO CONECTADO - userId/socketId =>", userId, socket.id);
            addUser(userId, socket.id);
            io.emit("getUsers", users);
        }); 

        socket.on('disconnect', (userId) => {
            console.log("SOCKET.IO USUARIO DESCONECTADO", socket.id);
            let remainingUsers = removeUser(socket.id);
            console.log("USUARIOS RESTANTES", remainingUsers);
            io.emit("getUsers", remainingUsers);
        }); 

        socket.on('readedNotification', (userId, notification) => {
            usersCtrl.updateReadedNotification(userId, notification);
        });
    });
}

export const getSocket = () => socket;
export const getIo = () => ioSocket;

//====FUNCTIONS====
const addUser = (userId, socketId) => {
    if(!users.some( (u) => u.userId === userId )){
        users.push({userId: userId, socketId: socketId});
        //users[socketId] = userId;
    }else{
        let user = users.find( u => u.userId === userId);
        let index = users.indexOf(user);
        user.socketId = socketId;
        users[index] = user;
    }
    console.log("USUARIOS CONECTADOS", users);
}

export const getUserById = (userId) => {
    let user = users.find( (u) => u.userId === userId);
    console.log("SOCKET.IO USUARIO A DEVOLVER", userId, user);
    return user.socketId;
}

const removeUser = (socketId) => {
    console.log("USUARIO A ELIMINAR --- socket/users", socketId, users);
    users = users.filter((user) => user.socketId !== socketId);
    return users;
}

//module.exports = {connection, getSocket};

