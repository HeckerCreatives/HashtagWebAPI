const { getMiner, editMiner, getUserMiner } = require("../controllers/miner")
const { protectsuperadmin, protectusers } = require("../middleware/middleware")

const router = require("express").Router()

router
.get("/getminer", protectusers, getMiner)
.get("/getuserminer", protectusers, getUserMiner)
.post("/editminer", protectsuperadmin, editMiner)

module.exports = router