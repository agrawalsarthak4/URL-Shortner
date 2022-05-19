const mongoose = require('mongoose')


const URLSchema = new mongoose.Schema({
    
    longUrl: {
        type:String,
        required:true,
    }, 
    shortUrl:  {
        type:String,
        required:true,
    },
    urlCode: {
        type:String,
        required:true,
        trim:true,
        unique:true
    }
   
})
module.exports = mongoose.model('Url', URLSchema)