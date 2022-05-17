const express = require('express');
const { route } = require('express/lib/application');
const router = express.Router();
const urlShortController = require("../controllers/urlShortController")



router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})


router.post("/url/shorten", urlShortController.shortenUrl)
router.get("/:urlCode", urlShortController.urlRedrict)




module.exports = router;