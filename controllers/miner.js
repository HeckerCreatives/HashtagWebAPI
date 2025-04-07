const { default: mongoose } = require("mongoose")
const Miner = require("../models/Miner")
const Inventoryhistory = require("../models/Inventoryhistory")
const Skip = require("../models/Skip")


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



// exports.getUserMiner = async(req, res)=> {
//     const { id, username } = req.user
//     const { type } = req.query

//     let value = false

//     if(type == 'micro_hash'){
//         value = true
//     }
//     else if (type == "mega_hash"){
//         const tempminer = await Inventoryhistory.findOne({owner: new mongoose.Types.ObjectId(id), minertype: "micro_hash", type: "Buy Micro Hash"})
//         .then(data => data)
//         if(!tempminer){
//             value = false
//         }
//     }

//     else if (type == "giga_hash"){
//         const tempminer = await Inventoryhistory.findOne({owner: new mongoose.Types.ObjectId(id), minertype: "giga_hash", type: "Buy Giga Hash"})
//         .then(data => data)
//         const tempminer1 = await Inventoryhistory.findOne({owner: new mongoose.Types.ObjectId(id), minertype: "micro_hash", type: "Buy Micro Hash"})
//         .then(data => data)

//         if(!tempminer || !tempminer1){
//             value = false
//         }

//     } 

//     const isskip = await Skip.findOne({owner: new mongoose.Types.ObjectId(id)})
//     .then(data => data)
//     .catch(err => {
//         console.log(`There's a problem fetching skip. Error: ${err}`)
//         return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details."})
//     })

//     if(isskip !== null){
//         value = true
//     }

//     return res.status(200).json({ message: "success", data: value})
// }

exports.getUserMiner = async (req, res) => {
    const { id } = req.user;
    const { type } = req.query;

    try {
        let value = true;

        if (type === 'micro_hash') {
            value = false;

        } else if (type === 'mega_hash') {
            const hasMicro = await Inventoryhistory.findOne({
                owner: new mongoose.Types.ObjectId(id),
                minertype: "micro_hash",
                type: "Buy Micro Hash"
            });

            if (hasMicro) {
                value = true;
            }

        } else if (type === 'giga_hash') {
            const hasGiga = await Inventoryhistory.findOne({
                owner: new mongoose.Types.ObjectId(id),
                minertype: "giga_hash",
                type: "Buy Giga Hash"
            });

            const hasMicro = await Inventoryhistory.findOne({
                owner: new mongoose.Types.ObjectId(id),
                minertype: "micro_hash",
                type: "Buy Micro Hash"
            });

            if (hasGiga && hasMicro) {
                value = true;
            }
        }

        return res.status(200).json({ message: "success", data: value });

    } catch (err) {
        console.error(`Error fetching user miner info: ${err}`);
        return res.status(400).json({
            message: "bad-request",
            data: "There's a problem with the server. Please contact customer support for more details."
        });
    }
};



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