import express, { urlencoded } from 'express';
import mongoose from 'mongoose';
import path from 'path'
import { PORT , MONGO_URI } from './config'
import errorHandler from './middleware/errorHandler';
import router from './routes'
const app = express();

mongoose.connect(MONGO_URI,  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error',console.error.bind(console , 'connection error'));
db.once('open',()=>{
console.log('database connection successfull.....')
})
global.appRoot = path.resolve(__dirname);
app.use(express.urlencoded({ extended : false }));
app.use(express.json());

app.use('/api', router);

app.use('/uploads', express.static('uploads'))



app.use(errorHandler)
app.listen(PORT , () =>{
console.log(`listning to the port ${PORT}`)
})