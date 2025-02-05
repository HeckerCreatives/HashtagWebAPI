const { default: mongoose } = require("mongoose")
const Inventory = require("../models/Inventory")
const Inventoryhistory = require("../models/Inventoryhistory")
const { saveinventoryhistory, getfarm } = require("../utils/inventorytools")
const { walletbalance, reducewallet, sendcommissionunilevel, addwallet } = require("../utils/walletstools")
const { DateTimeServerExpiration, DateTimeServer, AddUnixtimeDay, RemainingTime } = require("../utils/datetimetools")
const { addanalytics } = require("../utils/analyticstools")
const { addwallethistory } = require("../utils/wallethistorytools")
const Maintenance = require("../models/Maintenance")
const Miner = require("../models/Miner")

//  #region USER

exports.buyminer = async (req, res) => {
    const {id, username} = req.user
    const {type, priceminer } = req.body
    let adjustedProfit = 1

    if (type == "swift_lane"){
        const tempminer = await Inventoryhistory.findOne({owner: new mongoose.Types.ObjectId(id), minertype: "quick_miner", type: "Buy Quick Miner"})
        .then(data => data)
        if(!tempminer){
            adjustedProfit = 0.5
        }
    }

    else if (type == "rapid_lane"){
        //  ADD CONDITION HERE IF CLAIM SWIFT LANE
        let adjustedProfit = 1

        const tempminer = await Inventoryhistory.findOne({owner: new mongoose.Types.ObjectId(id), minertype: "swift_lane", type: "Buy Switf Lane"})
        .then(data => data)
        const tempminer1 = await Inventoryhistory.findOne({owner: new mongoose.Types.ObjectId(id), minertype: "quick_miner", type: "Buy Quick Miner"})
        .then(data => data)

        if(!tempminer || !tempminer1){
            adjustedProfit = 0.5
        }
        
    } 
    else if (type == "flash_miner"){
        //  ADD CONDITION HERE IF CLAIM SWIFT LANE
        let adjustedProfit = 1

        const tempminer = await Inventoryhistory.findOne({owner: new mongoose.Types.ObjectId(id), minertype: "swift_lane", type: "Buy Switf Lane"})
        .then(data => data)
        const tempminer1 = await Inventoryhistory.findOne({owner: new mongoose.Types.ObjectId(id), minertype: "quick_miner", type: "Buy Quick Miner"})
        .then(data => data)
        const tempminer2 = await Inventoryhistory.findOne({owner: new mongoose.Types.ObjectId(id), minertype: "rapid_lane", type: "Buy Rapid Lane"})
        .then(data => data)

        if(!tempminer || !tempminer1 || !tempminer2){
            adjustedProfit = 0.5
        }
        
    }

    const b1t1 = await Maintenance.findOne({ type: "b1t1", value: "1" })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting b1t1 maintenance. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: "There's a problem with the server! Please contact customer support."})
    })

    const totalminer = await Inventory.find({owner: new mongoose.Types.ObjectId(id), type: type})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting the inventory miner of ${id}. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: "There's a problem with the server! Please contact customer support."})
    })

    if (totalminer.length >= 2){
        return res.status(400).json({message: "failed", data: `You can only have a max of 2 active ${(type == "quick_miner" ? "Quick" : type == "swift_lane" ? "Swift Lane" : "Rapid Lane")} miners. Please complete either of the two to buy again.`})
    }

    const wallet = await walletbalance("creditwallet", id)

    if (wallet == "failed"){
        return res.status(400).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    }

    if (wallet == "nodata"){
        return res.status(400).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    }

    if (wallet < priceminer){
        return res.status(400).json({ message: 'failed', data: `You don't have enough funds to buy this miner! Please top up first and try again.` })
    }

    const miner = await Miner.findOne({ type: type })

    const finalprice = miner.profit * adjustedProfit

    if (priceminer < miner.min){
        return res.status(400).json({ message: 'failed', data: `The minimum price for ${miner.type} is ${miner.min} pesos`})
    }

    if (priceminer > miner.max){
        return res.status(400).json({ message: 'failed', data: `The maximum price for ${miner.type} is ${miner.max} pesos`})
    }

    const buy = await reducewallet("creditwallet", priceminer, id)

    if (buy != "success"){
        return res.status(400).json({ message: 'failed', data: `You don't have enough funds to buy this miner! Please top up first and try again.` })
    }

    const unilevelrewards = await sendcommissionunilevel(priceminer, id, miner.type)

    if (unilevelrewards != "success"){
        return res.status(400).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    }
    
    
    if(miner.isBuyonetakeone == '1'){
        await Inventory.create({owner: new mongoose.Types.ObjectId(id), type: miner.type, expiration: DateTimeServerExpiration(miner.duration), profit: finalprice, price: priceminer, startdate: DateTimeServer(), name: miner.name, duration: miner.duration})
        .catch(err => {
    
            console.log(`Failed to miner inventory data for ${username} type: ${type} b1t1: true, error: ${err}`)
    
            return res.status(400).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
        })
        const inventoryhistory = await saveinventoryhistory(id, miner.type, priceminer, `Buy ${miner.name} buy one take one`)

        await addanalytics(id, inventoryhistory.data.transactionid, `Buy ${miner.name} buy one take one`, `User ${username} bought ${miner.type}`, priceminer)

        await Inventory.create({owner: new mongoose.Types.ObjectId(id), type: miner.type, expiration: DateTimeServerExpiration(miner.duration), profit: finalprice, price: priceminer, startdate: DateTimeServer(), name: miner.name, duration: miner.duration})
        .catch(err => {
    
            console.log(`Failed to miner inventory data for ${username} type: ${type} b1t1: true, error: ${err}`)
    
            return res.status(400).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
        })
        const inventoryhistory1 = await saveinventoryhistory(id, miner.type, priceminer, `Buy ${miner.name} buy one take one`)

        await addanalytics(id, inventoryhistory1.data.transactionid, `Buy ${miner.name} buy one take one`, `User ${username} bought ${miner.type}`, priceminer)
    } else {

        await Inventory.create({owner: new mongoose.Types.ObjectId(id), type: miner.type, expiration: DateTimeServerExpiration(miner.duration), profit: finalprice, price: priceminer, startdate: DateTimeServer(), name: miner.name, duration: miner.duration})
        .catch(err => {
    
            console.log(`Failed to miner inventory data for ${username} type: ${type}, error: ${err}`)
    
            return res.status(400).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
        })
    
        
        const inventoryhistory = await saveinventoryhistory(id, miner.type, priceminer, `Buy ${miner.name}`)
        
        await addanalytics(id, inventoryhistory.data.transactionid, `Buy ${miner.name}`, `User ${username} bought ${miner.type}`, priceminer)
    }

    return res.json({message: "success"})
}

exports.getinventory = async (req, res) => {
    const {id, username} = req.user
    const {page, limit} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }

    const miner = await Inventory.find({owner: id})
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({'createdAt': -1})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to get inventory data for ${username}, error: ${err}`)

        return res.status(400).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const totalPages = await Inventory.countDocuments({owner: id})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to count documents inventory data for ${username}, error: ${err}`)

        return res.status(400).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const pages = Math.ceil(totalPages / pageOptions.limit)

    const data = {
        miners: {},
        totalPages: pages
    }

    let index = 0

    miner.forEach(dataminer => {
        const {_id, type, price, profit, duration, startdate, createdAt} = dataminer

        console.log(startdate, duration)
        console.log(AddUnixtimeDay(startdate, duration))

        const earnings = getfarm(startdate, AddUnixtimeDay(startdate, duration), (price * profit) + price)
        const remainingtime = RemainingTime(parseFloat(startdate), duration)

        data.miners[index] = {
            minerid: _id,
            type: type,
            buyprice: price,
            profit: profit,
            duration: duration,
            earnings: earnings,
            remainingtime: remainingtime,
            purchasedate: createdAt
        }

        index++
    })

    return res.json({message: "success", data: data})
}

exports.claimminer = async (req, res) => {
    const {id, username} = req.user

    const {minerid} = req.body

    if (!minerid){
        return res.status(400).json({message: "failed", data: "There's no existing miner! Please contact customer support for more details"})
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Step 1: Find and Delete Miner
        const minerinventorydata = await Inventory.findOneAndDelete(
            { _id: new mongoose.Types.ObjectId(minerid), owner: new mongoose.Types.ObjectId(id) },
            { returnDocument: "before", session }
        );

        if (!minerinventorydata) {
            await session.abortTransaction();
            return res.status(400).json({ message: "failed", data: "There's no existing miner! Please contact customer support for more details" });
        }

        // Step 2: Get Miner Data
        const miner = await Miner.findOne({ type: minerinventorydata.type }).session(session);

        if (!miner) {
            await session.abortTransaction();
            return res.status(400).json({ message: "failed", data: "There's no existing miner! Please contact customer support for more details" });
        }

        const remainingtime = RemainingTime(parseFloat(minerinventorydata.startdate), minerinventorydata.duration);

        if (remainingtime > 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: "failed", data: "There are still remaining time before claiming! Wait for the timer to complete." });
        }

        // Step 3: Calculate Earnings
        const earnings = (minerinventorydata.price * miner.profit) + minerinventorydata.price;

        // Step 4: Update Wallets (Ensure These Functions Support Transactions)
        await addwallet("minecoinwallet", earnings, id, session);
        await addwallethistory(id, "minecoinwallet", earnings, process.env.ADMIN_ID, minerinventorydata.name, session);
        const inventoryhistory = await saveinventoryhistory(id, minerinventorydata.type, earnings, `Claim ${minerinventorydata.name}`, session);
        await addanalytics(id, inventoryhistory.data.transactionid, `Claim ${minerinventorydata.name}`, `User ${username} claim earnings ${earnings}`, earnings, session);

        // Commit Transaction
        await session.commitTransaction();
        session.endSession();

        return res.json({ message: "success" });

    } catch (error) {
        console.log(`Error claiming miner: ${error}`);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: "error", data: "Something went wrong! Please try again later." });
    }

}

exports.getbuyhistory = async (req, res) => {
    const {id, username} = req.user
    const {page, limit} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }

    const history = await Inventoryhistory.find({
        owner: new mongoose.Types.ObjectId(id),
        type: { $regex: /^Buy/, $options: 'i' } 
    })
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({'createdAt': -1})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting the inventory history of ${username}. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: "There's a problem getting the inventory history. Please contact customer support."})
    })

    if (history.length <= 0){
        return res.json({message: "success", data: {
            history: [],
            totalpages: 0
        }})
    }

    const totalPages = await Inventoryhistory.countDocuments({owner: new mongoose.Types.ObjectId(id), $or: [{type: "Buy Quick Miner"}, {type: "Buy Swift Lane"}, {type: "Buy Rapid Lane"}]})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to count documents inventory history data for ${username}, error: ${err}`)

        return res.status(400).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const pages = Math.ceil(totalPages / pageOptions.limit)

    const data = {
        history: [],
        totalpages: pages
    }

    history.forEach(tempdata => {
        const {minertype, amount, createdAt} = tempdata

        data.history.push({
            minertype: minertype,
            amount: amount,
            createdAt: createdAt
        })
    })

    return res.json({message: "success", data: data})
}

exports.getclaimhistory = async (req, res) => {
    const {id, username} = req.user
    const {page, limit} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }

    const history = await Inventoryhistory.find({owner: new mongoose.Types.ObjectId(id), $or: [{type: "Claim Quick Miner"}, {type: "Claim Switf Lane"}, {type: "Claim Rapid Lane"}]})
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({'createdAt': -1})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting the inventory history of ${username}. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: "There's a problem getting the inventory history. Please contact customer support."})
    })

    if (history.length <= 0){
        return res.json({message: "success", data: {
            history: [],
            totalpages: 0
        }})
    }

    const totalPages = await Inventoryhistory.countDocuments({owner: new mongoose.Types.ObjectId(id), $or: [{type: "Buy Quick Miner"}, {type: "Claim Switf Lane"}, {type: "Buy Rapid Lane"}]})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to count documents inventory history data for ${username}, error: ${err}`)

        return res.status(400).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const pages = Math.ceil(totalPages / pageOptions.limit)

    const data = {
        history: [],
        totalpages: pages
    }

    history.forEach(tempdata => {
        const {minertype, amount, createdAt} = tempdata

        data.history.push({
            minertype: minertype,
            amount: amount,
            createdAt: createdAt
        })
    })

    return res.json({message: "success", data: data})
}

exports.gettotalpurchased = async (req, res) => {
    const {id, username} = req.user

    const finaldata = {
        totalpurchased: 0
    }

    const statisticInventoryHistory = await Inventoryhistory.aggregate([
        { 
            $match: { 
                owner: new mongoose.Types.ObjectId(id), 
                $or: [{type: "Buy Quick Miner"}, {type: "Buy Swift Lane"}, {type: "Buy Rapid Lane"}]
            } 
        },
        { 
            $group: { 
                _id: null, 
                totalAmount: { $sum: "$amount" } 
            } 
        }
    ])
    .catch(err => {
        console.log(`There's a problem getting the statistics of total purchase for ${username}. Error ${err}`)

        return res.status(400).json({message: "bad-request", data : "There's a problem getting the statistics of total purchased. Please contact customer support."})
    })

    if (statisticInventoryHistory.length > 0) {
        finaldata.totalpurchased = statisticInventoryHistory[0].totalAmount;
    }

    return res.json({message: "success", data: finaldata})
}

exports.getremainingunclaimedminer = async (req, res) => {
    const {id, username} = req.user
    const miner = await Inventory.find({owner: id})
    .sort({'createdAt': -1})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to get inventory data for ${username}, error: ${err}`)

        return res.status(400).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const data = {
        unclaimed: 0
    }

    miner.forEach(dataminer => {
        const {price, profit, duration, startdate} = dataminer

        const earnings = getfarm(startdate, AddUnixtimeDay(startdate, duration), (price * profit) + price)

        data.unclaimed += earnings
    })

    return res.json({message: "success", data: data})
}

//  #endregion

//  #region SUPERADMIN

exports.getplayerinventoryforsuperadmin = async (req, res) => {
    const {id, username} = req.user
    const {playerid, page, limit} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }

    const miner = await Inventory.find({owner: playerid})
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({'createdAt': -1})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to get inventory data for ${playerid}, error: ${err}`)

        return res.status(400).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const totalPages = await Inventory.countDocuments({owner: playerid})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to count documents inventory data for ${playerid}, error: ${err}`)

        return res.status(400).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const pages = Math.ceil(totalPages / pageOptions.limit)

    const data = {
        inventory: []
    }

    let index = 0

    miner.forEach(dataminer => {
        const {_id, type, price, profit, duration, startdate, createdAt} = dataminer

        const earnings = getfarm(startdate, AddUnixtimeDay(startdate, duration), (price * profit) + price)
        const remainingtime = RemainingTime(parseFloat(startdate), AddUnixtimeDay(startdate, duration))

        data.inventory[index] = {
            minerid: _id,
            type: type,
            buyprice: price,
            profit: profit,
            duration: duration,
            earnings: earnings,
            remainingtime: remainingtime,
            purchasedate: createdAt
        }

        index++
    })

    data["totalPages"] = pages

    return res.json({message: "success", data: data})
}

//  #endregion