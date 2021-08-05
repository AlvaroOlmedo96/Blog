import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import pkg from '../package.json';

import {createRoles} from './libs/initialSetup';

import postsRoutes from './routes/posts.routes';
import authRoutes from './routes/auth.routes';

const app = express();

app.set('pkg', pkg);

createRoles();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        author: app.get('pkg').author,
        description: app.get('pkg').description,
        version: app.get('pkg').version
    });
});


app.use('/api/posts', postsRoutes);
app.use('/api/auth', authRoutes);



export default app;