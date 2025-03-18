const router = require("express").Router()
const { getremainingunclaimedminer, buyminer, getinventory, getclaimhistory, getbuyhistory, claimminer, getplayerinventoryforsuperadmin, maxplayerinventorysuperadmin } = require("../controllers/inventory")
const { protectplayer, protectsuperadmin } = require("../middleware/middleware")

router
    .get("/getremainingunclaimedminer", protectplayer, getremainingunclaimedminer)
    .get("/getbuyhistory", protectplayer, getbuyhistory)
    .get("/getclaimhistory", protectplayer, getclaimhistory)
    .get("/getinventory", protectplayer, getinventory)
    .get("/getplayerinventoryforsuperadmin", protectsuperadmin, getplayerinventoryforsuperadmin)
    .post("/buyminer", protectplayer, buyminer)
    .post("/claimminer", protectplayer, claimminer)
    .post("/maxplayerinventorysuperadmin", protectsuperadmin, maxplayerinventorysuperadmin)

module.exports = router;
