
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
            console.log("SOCKET.IO USUARIO CONECTADO", userId, socket.id);
            addUser(userId, socket.id);
            io.emit("getUsers", users);
        }); 

        socket.on('disconnect', (userId) => {
            console.log("SOCKET.IO USUARIO DESCONECTADO", userId);
            removeUser(socket.id);
            io.emit("getUsers", users);
        }); 
    });
}

export const getSocket = () => socket;
export const getIo = () => ioSocket;

//====FUNCTIONS====
const addUser = (userId, socketId) => {
    if(!users.some( (u) => u.userId === userId )){
        users.push({userId: userId, socketId: socketId});
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
    users = users.filter((user) => user.socketId !== socketId);
    console.log("USUARIOS CONECTADOS", users);
}

//module.exports = {connection, getSocket};

