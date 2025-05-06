const router = require("express").Router()
const { playerwallethistory, getwallettotalearnings, getplayerwallethistoryforadmin, deleteplayerwallethistoryforadmin } = require("../controllers/wallethistory")
const { protectplayer, protectsuperadmin } = require("../middleware/middleware")

router
    .get("/userwallethistory", protectplayer, playerwallethistory)
    .get("/getwallettotalearnings", protectplayer, getwallettotalearnings)
    .get("/getplayerwallethistoryforadmin", protectsuperadmin, getplayerwallethistoryforadmin)
    .post("/deleteplayerwallethistoryforadmin", protectsuperadmin, deleteplayerwallethistoryforadmin)

module.exports = router;
