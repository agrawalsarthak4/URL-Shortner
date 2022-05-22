require('dotenv').config()
const Url = require("../models/urlModel");
const shortid = require('shortid')
const redis = require("redis");
const { promisify } = require("util");
const urlModel = require('../models/urlModel');


const redisClient = redis.createClient(
    13190,
    "redis-13190.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("gkiOIPkytPI3ADi14jHMSWkZEo2J5TDG", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});




const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);




const isvalid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.length === 0) return false;
    return true;
};

let port = process.env.PORT;
const baseUrl = "http:localhost:" + port;

let shortenUrl = async function (req, res) {
        let  longUrl  = req.body.longUrl
        const shortCode = shortid.generate()

        if(longUrl){
            try{
                longUrl = longUrl.trim()
                
        
        if(!(longUrl.includes('//'))){
            return res.status(400).send({ status: false, message: "Please Provide Valid URL" })
        }

        const urlParts= longUrl.split('//') 
        const scheme = urlParts[0]              //element before //
        const uri = urlParts[1]                 //element after //

        if(!(uri.includes('.'))){
            return res.status(400).send({ status: false, message: "Please Provide Valid URL" })
        }

        const uriParts = uri.split('.')

        if(!(((scheme=="http:")||(scheme=="https:"))) && ((urlParts[0].trim.length)&&(urlParts[1].trim.length)))
        return res.status(400).send({ status: false, message: "Please Provide Valid URL" })


        if (!isvalid(longUrl)) {
            return res.status(400).send({ status: false, message: "Url is Require" })
        }

        shortenedUrlDetails = await urlModel.findOne({
            longUrl: longUrl
        })

        if(shortenedUrlDetails){
            return res.status(201).send({ status: true, data: shortenedUrlDetails })

        }
           else {
            const shortUrl = baseUrl + '/' + shortCode.toLowerCase()
            shortenedUrlDetails = await urlModel.create({ longUrl: longUrl , shortUrl: shortUrl, urlCode: shortCode})
             
            await SET_ASYNC(shortCode.toLowerCase() ,longUrl)
            return res.status(201).send({ status: true, data: shortenedUrlDetails })

           }

            }
       

    catch (err) {
        res.status(500).send({ status: false, msg: err.message })

    }

}
}



let urlRedrict = async function (req, res) {
    try {
        let urlCode = req.params.urlCode;
        urlCode = urlCode.trim()



        let longUrlLink = await GET_ASYNC(urlCode)

        if (longUrlLink) {
           
            return res.redirect(302,longUrlLink);
        } else {
            const longUrlLink = await Url.findOne({ urlCode: urlCode })
            if (longUrlLink) {
              
                return res.redirect(longUrlLink.longUrl);
            }
            else{
                return res.status(404).send({ status: false, message: "url Not Exist" })
            }
        }}
  

    catch (err) {       
        return res.status(500).send(err.message)
    }
}

module.exports = { shortenUrl, urlRedrict }