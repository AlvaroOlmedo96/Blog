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
import * as socketIO from './middlewares/socketWeb';

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
app.use('/api/uploads/profile', authJwt.verifyToken, express.static(path.join(__dirname, '/public/uploads')), usersRoutes);


//Requiere esta configuracion para que funcione socket.io
const server = require('http').createServer(app);
socketIO.connection(server, whitelist);


export default server;