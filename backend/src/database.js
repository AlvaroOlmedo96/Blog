import mongoose from 'mongoose';
import * as config from './config';

const dbDev = config.default.databaseDevURL;
const dbProd = config.default.databaseProdURL;

mongoose.connect(dbDev, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then( db => {
    console.log("Db is connected");
}).catch( error => {
    console.log("Db Error", error);
});