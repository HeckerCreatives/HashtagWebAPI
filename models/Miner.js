const { default: mongoose } = require("mongoose")

            
const MinerSchema = new mongoose.Schema({
    type: {
        type: String,
    },
    name: {
        type: String,
    },
    profit: {
        type: Number,
    },
    duration: {
        type: Number,
    },
    min: {
        type: Number,
    },
    max: {
        type: Number
    },
    isBuyonetakeone: {
        type: String,
    },
    isActive: {
        type: String,
        default: "1"
    },
},
{ timestamps: true })
            
const Miner = mongoose.model("Miner", MinerSchema)
module.exports = Miner