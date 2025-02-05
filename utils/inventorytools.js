const { default: mongoose } = require("mongoose")
const Inventoryhistory = require("../models/Inventoryhistory")

exports.minerdata = (type) => {
    const miner = {
        quick_miner: {
            type: "quick_miner",
            name: "Quick Miner",
            profit: 0.20,
            duration: 5,
            min: 500,
            max: 2000
        },
        swift_lane: {
            type: "swift_lane",
            name: "Switf Lane",
            profit: 0.60,
            duration: 10,
            min: 2000,
            max: 20000
        },
        rapid_lane: {
            type: "rapid_lane",
            name: "Rapid Lane",
            profit: 1.5,
            duration: 20,
            min: 20000,
            max: 2000000
        }
    }

    return miner[type] || {type: "", profit: 0, duration: 0, min: 0, max: 0, name: ""}
}

exports.saveinventoryhistory = async(id, type, amount, historytype) => {
    const history = await Inventoryhistory.create({owner: new mongoose.Types.ObjectId(id), minertype: type, type: historytype, amount: amount})
    .catch(err => {
        return {
            message: "bad-request"
        }
    })

    return {
        message: "success",
        data: {
            transactionid: history._id
        }
    }
}

exports.getfarm = (timestarted, unixtime, maxtotal) => {
    // Start time and expiration time in Unix timestamps
    const startTime = parseFloat(timestarted);
    const expirationTime = parseFloat(unixtime);

    // Get the current time in Unix timestamp format
    const currentTime = Math.floor(new Date().getTime() / 1000);

    // Maximum total coins to be farmed
    const maxTotalCoins = parseFloat(maxtotal);

    // Calculate total farming duration in seconds
    const totalFarmingDuration = expirationTime - startTime;

    // Calculate coins per hour
    const coinsPerHour = (maxTotalCoins / (totalFarmingDuration / 3600));

    // Calculate current time between start time and expiration time in seconds
    const currentTimeBetween = Math.min(currentTime - startTime, totalFarmingDuration); // Consider current time up to expiration

    // Calculate total coins farmed
    const totalCoinsFarmed = Math.min((currentTimeBetween / 3600 * coinsPerHour), maxTotalCoins);

    return totalCoinsFarmed
}