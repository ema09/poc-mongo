const mongoose = require('mongoose');

const postSchema = mongoose.Schema();


module.exports = mongoose.model('benestareFTV', postSchema, 'ContoEnergia');