
const Url = require("../models/urlModel");
const validUrl = require('valid-url')
const shortid = require('shortid')


const isvalid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.length === 0) return false;
    return true;
};

const isvalidRequestBody = function (requestbody) {
    return Object.keys(requestbody).length > 0;
};

const baseUrl = 'http:localhost:3000'

let shortenUrl = async function (req, res) {
    try {
        let {longUrl}= req.body
       longUrl=longUrl.trim()

        if(!isvalidRequestBody(req.body)){
            return res.status(400).send({status: false, message: "Invalid Request"})
        }

        
        if(!isvalid(longUrl)){
            return res.status(400).send({status: false, message: "Url is Required"})
        }

        if (!validUrl.isUri(baseUrl)) {
            return res.status(401).send({status: false, message: "Invalid base URL"})
        }

        
        const urlCodeData = shortid.generate();
        const urlCode=urlCodeData.toLowerCase()

        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({status: false, message: "Invalid Long URL"})  //
        }


        let url = await Url.findOne({ longUrl })
        if (url) {
            return res.status(409).send({status: false, message: "url already Exist"})
        }

        const shortUrl = baseUrl + '/' + urlCode


       const urlLink = await Url.create({longUrl,shortUrl,urlCode})
       const getUrl=await Url.findById(urlLink.id).select({_id:0,__v: 0})
        return res.status(200).send({ data:getUrl})
    }
   
    catch (err) {
    console.log(err)
    res.status(500).json('Server Error')
}

}




let urlRedrict = async function (req, res) {
    try {
        const urlCode=req.params.urlCode;
        const url = await Url.findOne({ urlCode:urlCode})
        
        if (!url) {
            return res.status(404).send({status: false, message: "url Not found"})
        }
        return res.status(301).redirect(url.longUrl)
    }
    
    catch (err) {
        console.error(err)
        res.status(500).send(  {data: err.message})
    }
}

module.exports = { shortenUrl, urlRedrict }
// Redirect to the original URL corresponding
// Use a valid HTTP status code meant for a redirection scenario.
// Return a suitable error for a url not found
// Return HTTP status 400 for an invalid request
        // res.status(500).send('Server Error')

