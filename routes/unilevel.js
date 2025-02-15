const router = require("express").Router()
const { playerunilevel, playeviewadminunilevel } = require("../controllers/unilevel")
const { protectplayer, protectsuperadmin } = require("../middleware/middleware")

router
    .get("/userunilevel", protectplayer, playerunilevel)
    .get("/playeviewadminunilevel", protectsuperadmin, playeviewadminunilevel)

module.exports = router;
