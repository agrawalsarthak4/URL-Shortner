
require('dotenv').config()
const Url = require("../models/urlModel");
const validUrl = require('valid-url')
const shortid = require('shortid')
const redis = require("redis");
const { promisify } = require("util");


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
    try {
        let { longUrl } = req.body



        if (Object.keys(req.body).length != 1) {
            return res.status(400).send({ status: false, message: "Invalid Request" })
        }

        longUrl = longUrl.trim()

        if (!isvalid(longUrl)) {
            return res.status(400).send({ status: false, message: "Url is Require" })
        }

       

        if (!validUrl.isUri(baseUrl)) {
            return res.status(400).send({ status: false, message: "Invalid base URL" })
        }


        const urlCodeData = shortid.generate();
        const urlCode = urlCodeData.toLowerCase()

        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({ status: false, message: "Invalid Long URL" })
        }

        let longUrlLink1 = await GET_ASYNC(`${longUrl}`)
        console.log(longUrlLink1)

        let longUrlLink = JSON.parse(longUrlLink1);

        console.log(longUrlLink)
        if (longUrlLink) {
           
            return res.status(200).send({ data: longUrlLink })        }

        const shortUrl = baseUrl + '/' + urlCode


        const urlLink = await Url.create({ longUrl, shortUrl, urlCode })
        const getUrl = await Url.findById(urlLink.id).select({ _id: 0, __v: 0 })
        await SET_ASYNC(`${urlLink.longUrl}`,JSON.stringify(getUrl))

return res.status(201).send({ data: getUrl })    }

    catch (err) {
        console.log(err)
        res.status(500).json('Server Error')
    }

}




let urlRedrict = async function (req, res) {
    try {
        let urlCode = req.params.urlCode;
        urlCode = urlCode.trim()

        const shortUrl = baseUrl + '/' + urlCode

        if (!validUrl.isUri(shortUrl)) {
            return res.status(400).send({ status: false, message: "Invalid URL" })
        }

        let longUrlLink = await GET_ASYNC(`${urlCode}`)

        if (longUrlLink) {
           
            return res.redirect(302,longUrlLink);
        } else {
            let longUrlLink = await Url.findOne({ urlCode: urlCode })


            if (!longUrlLink) {
                return res.status(404).send({ status: false, message: "url Not Exist" })
            }

            await SET_ASYNC(`${urlCode}`, `${longUrlLink.longUrl}`)
            return res.redirect(301,longUrlLink.longUrl);
        }

    }

    

    catch (err) {
        console.error(err)
        return res.status(500).send(err.message)
    }
}

module.exports = { shortenUrl, urlRedrict }
