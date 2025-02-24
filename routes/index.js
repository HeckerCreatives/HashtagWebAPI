const routers = app => {
    console.log("Routers are all available");

    app.use("/auth", require("./auth"))
    app.use("/wallets", require("./userwallets"))
    app.use("/wallethistory", require("./wallethistory"))
    app.use("/user", require("./users"))
    app.use("/inventory", require("./inventory"))
    app.use("/unilevel", require("./unilevel"))
    app.use("/miner", require("./miner"))    
    app.use("/payout", require("./payout"))
    app.use("/analytics", require("./analytics"))
    app.use("/sociallinks", require("./sociallinks"))
    app.use("/staffusers", require("./staffusers"))
    app.use("/payin", require("./payin"))
    app.use("/pricepool", require("./pricepool"))
    app.use("/pricepoolhistory", require("./pricepoolhistory"))
    app.use("/globalpass", require("./globalpass"))
    app.use("/maintenance", require("./maintenance"))
}

module.exports = routers