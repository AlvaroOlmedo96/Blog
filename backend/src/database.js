import mongoose from 'mongoose';
import * as config from './config';

const dbDev = config.default.databaseDevURL;
const dbProd = config.default.databaseProdURL;

mongoose.connect(dbProd, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then( db => {
    console.log("MongoDB is connected");
}).catch( error => {
    console.log("MongoDB Error", error);
});