const mongoose = require('mongoose');
const Inventoryhistory = require('./models/Inventoryhistory');

async function checkDuplicateClaims() {
    try {
        // Connect to the database
        await mongoose.connect('mongodb+srv://doadmin:n5938lRCUq271j6t@speedmine-database-1fc2a06b.mongo.ondigitalocean.com/speedmine?tls=true&authSource=admin&replicaSet=speedmine-database', { useNewUrlParser: true, useUnifiedTopology: true });

        // Find users with multiple claimed miners with the same criteria
        const duplicateClaims = await Inventoryhistory.aggregate([
            {
                $match: {
                    $or: [
                        { type: { $regex: /buy/i } },
                        { type: { $regex: /claim/i } }
                    ]
                }
            },
            {
                $project: {
                    userId: "$owner",
                    type: 1,
                    minertype: 1,
                    amount: 1,
                    createdAt: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                }
            },
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        type: "$type",
                        minertype: "$minertype",
                        amount: "$amount",
                        createdAt: "$createdAt"
                    },
                    actions: { $push: "$type" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 1,
                    actions: 1,
                    buyCount: {
                        $size: {
                            $filter: {
                                input: "$actions",
                                as: "action",
                                cond: { $regexMatch: { input: "$$action", regex: /buy/i } }
                            }
                        }
                    },
                    claimCount: {
                        $size: {
                            $filter: {
                                input: "$actions",
                                as: "action",
                                cond: { $regexMatch: { input: "$$action", regex: /claim/i } }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id.userId",
                    totalBuyCount: { $sum: "$buyCount" },
                    totalClaimCount: { $sum: "$claimCount" }
                }
            },
            {
                $match: {
                    $expr: { $gt: ["$totalClaimCount", "$totalBuyCount"] }
                }
            }
        ]);

        for (const user of duplicateClaims) {
            console.log(`User ${user._id} has more claims than buys:`);
            console.log(`Total Buys: ${user.totalBuyCount}, Total Claims: ${user.totalClaimCount}`);
        }

        console.log('Duplicate claims check completed.');
    } catch (err) {
        console.error('Error checking duplicate claims:', err);
    } finally {
        // Close the database connection
        mongoose.connection.close();
    }
}

checkDuplicateClaims();