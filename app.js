const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');


const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');
const benestareRoutes = require('./routes/benestare');
const homeRoutes = require('./routes/home');
const scambioRoutes = require('./routes/scambio');
const chartRoutes = require('./routes/chart');

const app = express();
//
//mongodb+srv://ema:' + process.env.MONGO_ATLAS_PW + '@cluster0-3rvgp.mongodb.net/node-angular?retryWrites=true&w=majority
    mongoose.connect('mongodb+srv://gseuser:zaq12wsx@cluster0-uwxjd.mongodb.net/mydb?retryWrites=true&w=majority')
    .then(() => {
        console.log('Connected to MongoDb');
    }).catch(() =>{
        console.log('Connection failed!');
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    next();
});

app.use("/api/posts",postRoutes);
app.use("/api/user",userRoutes);
app.use("/api/benestare",benestareRoutes);
app.use("/api/home",homeRoutes);
app.use("/api/scambio",scambioRoutes);
app.use("/api/chart",chartRoutes);

module.exports = app;