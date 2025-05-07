const router = require("express").Router()
const { playerwallethistory, getwallettotalearnings, getplayerwallethistoryforadmin, deleteplayerwallethistoryforadmin, getwalletstatistics, getwalletstatisticssuperadmin, editplayerwallethistoryforadmin, createplayerwallethistoryforadmin } = require("../controllers/wallethistory")
const { protectplayer, protectsuperadmin } = require("../middleware/middleware")

router
    .get("/getwalletstatistics", protectplayer, getwalletstatistics)
    .get("/getwalletstatisticssuperadmin", protectsuperadmin, getwalletstatisticssuperadmin)
    .get("/userwallethistory", protectplayer, playerwallethistory)
    .get("/getwallettotalearnings", protectplayer, getwallettotalearnings)
    .get("/getplayerwallethistoryforadmin", protectsuperadmin, getplayerwallethistoryforadmin)

    
    .post("/editplayerwallethistoryforadmin", protectsuperadmin, editplayerwallethistoryforadmin)
    .post("/createplayerwallethistoryforadmin", protectsuperadmin, createplayerwallethistoryforadmin)
    .post("/deleteplayerwallethistoryforadmin", protectsuperadmin, deleteplayerwallethistoryforadmin)
    
module.exports = router;
