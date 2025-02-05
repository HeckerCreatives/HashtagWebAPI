const { default: mongoose } = require("mongoose")
const Miner = require("../models/Miner")
const Inventoryhistory = require("../models/Inventoryhistory")


exports.getMiner = async(req, res)=> {
 
    const miners = await Miner.find()
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem fetching miners. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details."})
    })

    const data = []

    miners.forEach(temp => {
        data.push({
            id: temp._id,
            name: temp.name,
            min: temp.min,
            max: temp.max,
            duration: temp.duration,
            profit: temp.profit,
            isBuyonetakeone: temp.isBuyonetakeone
        })
    })
    return res.status(200).json({ message: "success", data: data})
}



exports.getUserMiner = async(req, res)=> {
    const { id, username } = req.user
    const { type } = req.query

    let value = true
    if (type == "swift_lane"){
        const tempminer = await Inventoryhistory.findOne({owner: new mongoose.Types.ObjectId(id), minertype: "quick_miner", type: "Buy Quick Miner"})
        .then(data => data)
        if(!tempminer){
            value = false
        }
    }

    else if (type == "rapid_lane"){
        const tempminer = await Inventoryhistory.findOne({owner: new mongoose.Types.ObjectId(id), minertype: "swift_lane", type: "Buy Switf Lane"})
        .then(data => data)
        const tempminer1 = await Inventoryhistory.findOne({owner: new mongoose.Types.ObjectId(id), minertype: "quick_miner", type: "Buy Quick Miner"})
        .then(data => data)

        if(!tempminer || !tempminer1){
            value = false
        }

    } 
    else if (type == "flash_miner"){

        const tempminer = await Inventoryhistory.findOne({owner: new mongoose.Types.ObjectId(id), minertype: "swift_lane", type: "Buy Switf Lane"})
        .then(data => data)
        const tempminer1 = await Inventoryhistory.findOne({owner: new mongoose.Types.ObjectId(id), minertype: "quick_miner", type: "Buy Quick Miner"})
        .then(data => data)
        const tempminer2 = await Inventoryhistory.findOne({owner: new mongoose.Types.ObjectId(id), minertype: "rapid_lane", type: "Buy Rapid Lane"})
        .then(data => data)

        if(!tempminer || !tempminer1 || !tempminer2){
            value = false
        }
        
    }

    return res.status(200).json({ message: "success", data: value})
}

exports.editMiner = async (req, res) => {

    const { minerid, duration, min, max, profit, isBuyonetakeone } = req.body

    if(!minerid){
        return res.status(400).json({ message: "failed", data: "Incomplete form data."})
    }

    await Miner.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(minerid)
        },
        {
            $set: {
                duration: parseFloat(duration),
                profit: parseFloat(profit),
                min: parseFloat(min),
                max: parseFloat(max),
                isBuyonetakeone: isBuyonetakeone
            }
        }
    )
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while updating ${minerid} miner. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details."})
    })

    return res.status(200).json({ message: "success" })
}