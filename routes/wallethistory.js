const router = require("express").Router()
const { playerwallethistory, getwallettotalearnings, getplayerwallethistoryforadmin, deleteplayerwallethistoryforadmin, getwalletstatistics, getwalletstatisticssuperadmin } = require("../controllers/wallethistory")
const { protectplayer, protectsuperadmin } = require("../middleware/middleware")

router
    .get("/getwalletstatistics", protectplayer, getwalletstatistics)
    .get("/getwalletstatisticssuperadmin", protectsuperadmin, getwalletstatisticssuperadmin)
    .get("/userwallethistory", protectplayer, playerwallethistory)
    .get("/getwallettotalearnings", protectplayer, getwallettotalearnings)
    .get("/getplayerwallethistoryforadmin", protectsuperadmin, getplayerwallethistoryforadmin)
    .post("/deleteplayerwallethistoryforadmin", protectsuperadmin, deleteplayerwallethistoryforadmin)

module.exports = router;
