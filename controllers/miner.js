const { default: mongoose } = require("mongoose")
const Miner = require("../models/Miner")
const Inventoryhistory = require("../models/Inventoryhistory")
const Skip = require("../models/Skip")


exports.getMiner = async(req, res)=> {
 
    let miners = await Miner.find()
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem fetching miners. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details."})
    })

    
    if (miners.length === 3) {
        const newMinerz = [
            {
                type: "tera_hash",
                name: "Tera Hash",
                profit: 2.0,
                duration: 56,
                min: 5000,
                max: 50000,
                isBuyonetakeone: "0",
                isActive: "1"
            },
            {
                type: "ulti_hash",
                name: "Ulti Hash",
                profit: 0.50,
                duration: 14,
                min: 1000,
                max: 10000,
                isBuyonetakeone: "0",
                isActive: "1"
            },
            {
                type: "hash_care",
                name: "Hash Care",
                profit: 1.2,
                duration: 28,
                min: 2000,
                max: 20000,
                isBuyonetakeone: "0",
                isActive: "1"
            }
        ]
        await Miner.bulkWrite(
            newMinerz.map((Miner) => ({
                insertOne: { document: Miner },
            }))
        )
        miners = await Miner.find()
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem fetching miners after adding new ones. Error: ${err}`)
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details."})
        })
    }
    
    const sortOrder = ['micro_hash', 'mega_hash', 'giga_hash', 'tera_hash', 'ulti_hash', 'hash_care'];
    miners.sort((a, b) => {
        return sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type);
    });
    const data = []

    miners.forEach(temp => {
        data.push({
            id: temp._id,
            name: temp.name,
            min: temp.min,
            max: temp.max,
            duration: temp.duration,
            profit: temp.profit,
            isBuyonetakeone: temp.isBuyonetakeone,
            isActive: temp.isActive || "1",
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

        value = true

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

    const { minerid, duration, min, max, profit, isBuyonetakeone, isActive } = req.body

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
                isBuyonetakeone: isBuyonetakeone,
                isActive: isActive
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