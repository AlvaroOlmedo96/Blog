import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import pkg from '../package.json';
import {createRoles} from './libs/initialSetup';
import postsRoutes from './routes/posts.routes';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import path from 'path';
import * as authJwt from './middlewares/authJwt';

const app = express();

const whitelist = ['http://localhost:4200', 'http://192.168.1.38'];

//Se comprueba si ya existen Roles en bbdd, de lo contrario se crearan
createRoles();

app.use(cors({credentials: true, origin: true}));
app.use(morgan('dev'));
app.use(express.json());

app.set('pkg', pkg);
app.get('/', (req, res) => {
    res.json({
        author: app.get('pkg').author,
        description: app.get('pkg').description,
        version: app.get('pkg').version
    });
});


app.use('/api/posts', postsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/uploads/profile', authJwt.verifyToken, express.static(path.join(__dirname, '/public/uploads/profile')), usersRoutes);


//Requiere esta configuracion para que funcione socket.io
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origins: whitelist
    }
});
//------Configuramos Socket.io-------
io.on('connection', (socket) => {
    const idHandSocket = socket.id; //Cada vez que alguien se conecta se genera un Id único.
    const { nameRoom } = socket.handshake.query;

    const sala = socket.join(nameRoom);

    console.log(`SOCKET.IO === Se ha conectado el dispositivo ${idHandSocket} en la sala ${sala}`);

    socket.on('event', (res) => {
        const data = res;
        console.log("SOCKET.IO event ===" , res);

        //socket.emit(grupo) => emite el evento a todos los dispositivos conectados pertenecientes a un grupo(socket.join()) incluyendo al emisor del evento
        //socket.to(grupo) => lo mismo que emit() pero no incluye al emisor del evento
        socket.to().emit('event', res);
    });
});


export default server;