const router = require("express").Router()
const { playerwallets, getplayerwalletforadmin, editplayerwalletforadmin, edituserwalletforadmin, sendplayerwalletsuperadmin } = require("../controllers/wallets")
const { protectplayer, protectsuperadmin } = require("../middleware/middleware")

router
    .get("/userwallets", protectplayer, playerwallets)
    .get("/getplayerwalletforadmin", protectsuperadmin, getplayerwalletforadmin)
    .post("/editplayerwalletforadmin", protectsuperadmin, edituserwalletforadmin)
    .post("/sendplayerwalletforadmin", protectsuperadmin, sendplayerwalletsuperadmin)

module.exports = router;
