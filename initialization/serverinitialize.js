const { default: mongoose } = require("mongoose")
const Users = require("../models/Users")
const Staffusers = require("../models/Staffusers")
const Userwallets = require("../models/Userwallets")
const Userdetails = require("../models/Userdetails")
const Maintenance = require("../models/Maintenance")
const Miner = require("../models/Miner")
const Pricepool = require("../models/Pricepool")
const Sociallinks = require("../models/Sociallinks")
const GlobalPassword = require("../models/Globalpass")

exports.initialize = async (req, res) => {

    const csadmin = await Users.findOne({username: "hashbot"})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting cs user data ${err}`)
        return
    })

    if (!csadmin){
        const player = await Users.create({_id: new mongoose.Types.ObjectId(process.env.ADMIN_ID), username: "hashbot", password: "IO09a23SSKAdN", gametoken: "", webtoken: "", bandate: "none", banreason: "", status: "active"})
        
        await Userdetails.create({owner: new mongoose.Types.ObjectId(player._id), phonenumber: "", fistname: "", lastname: "", address: "", city: "", country: "", postalcode: "", profilepicture: ""})
        .catch(async err => {

            await Users.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

            console.log(`Server Initialization Failed, Error: ${err}`);

            return
        })
    
        const wallets = ["creditwallet", "minecoinwallet", "commissionwallet"]

        wallets.forEach(async (data) => {
            await Userwallets.create({owner: new mongoose.Types.ObjectId(player._id), type: data, amount: 0})
            .catch(async err => {

                await Users.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

                await Userdetails.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

                console.log(`Server Initialization Failed, Error: ${err}`);
    
                return
            })
        })
    }

    const staff = await Staffusers.find()
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting staff user data ${err}`)
        return
    })

    if (staff.length <= 0){
        await Staffusers.create({_id: new mongoose.Types.ObjectId(process.env.ADMIN_ID), username: "hashbotadmin", password: "IO09a23SSKAdN", webtoken: "", status: "active", auth: "superadmin"})
        .catch(err => {
            console.log(`There's a problem creating staff user data ${err}`)
            return
        })
    }

    const maintenances = await Maintenance.find()
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting maintenance data ${err}`)
        return
    })

    const mainte = [
        { insertOne: { document: { type: "b1t1", value: "0", createdAt: new Date(), updatedAt: new Date() }}},  
        { insertOne: { document: { type: "payout", value: "1", createdAt: new Date(), updatedAt: new Date() }}}
    ]

    if (maintenances.length <= 0){
        await Maintenance.bulkWrite(mainte)
    }

    const Miners = await Miner.find()
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting creature data ${err}`)
        return
    })



    if(Miners.length <= 0){
        const Minerz = [
            {
                    type: "micro_hash",
                    name: "Micro Hash",
                    profit: 0.20,
                    duration: 7,
                    min: 500,
                    max: 5000
            },
            {
                    type: "mega_hash",
                    name: "Mega Hash",
                    profit: 0.50,
                    duration: 14,
                    min: 1000,
                    max: 10000
            },
            {
                    type: "giga_hash",
                    name: "Giga Hash",
                    profit: 1.2,
                    duration: 28,
                    min: 2000,
                    max: 20000
            }
        ];

        await Miner.bulkWrite(
            Minerz.map((Miner) => ({
                insertOne: { document: Miner },
            }))
        )
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating creature data ${err}`)
            return
        })
    }

    const sociallinks = await Sociallinks.find()
    .then(data => data)
    .catch(err => {
        console.log(`Error finding Social Links data: ${err}`)
    })


    if(sociallinks.length <= 0){
        const socialinksdata = ["facebook", "telegram", "instagram", "x"]

        const socialinksbulkwrite = socialinksdata.map(titles => ({
            insertOne: {
                document: { title: titles, link: ""}
            }
        }))

        await Sociallinks.bulkWrite(socialinksbulkwrite)
        .catch(err => {
            console.log(`Error creating social links data: ${err}`)
            return
        }) 
    }

    // initialize global password

    const hasGlobalpassword = await GlobalPassword.find({ status: true })
    .then(data => data)
    .catch(err => {
        console.log(`Error finding Global Password data: ${err}`)
    })

    if (hasGlobalpassword.length <= 0) {
        await GlobalPassword.create({
            secretkey: "IO09a23SSKAdN",
            owner: new mongoose.Types.ObjectId(process.env.ADMIN_ID),
            status: true,
        })
        .then(data => data)
        .catch(err => {
            console.log(`Error creating Global Password data: ${err}`)
            return
        }   )

        console.log("Global Password Created")
    }

    console.log("Server Initialization Success")
}