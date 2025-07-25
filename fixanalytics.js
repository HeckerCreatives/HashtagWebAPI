const mongoose = require('mongoose');
const Analytics = require('./models/Analytics');
const Inventoryhistory = require('./models/Inventoryhistory');
const Wallethistory = require('./models/Wallethistory');

async function fixAnalyticsData() {
    try {
        // Connect to the database
        await mongoose.connect('mongodb+srv://doadmin:n5938lRCUq271j6t@speedmine-database-1fc2a06b.mongo.ondigitalocean.com/speedmine?tls=true&authSource=admin&replicaSet=speedmine-database', { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });

        console.log('Connected to database. Starting analytics data fix...');

        // Data to fix based on the provided _id values
        const fixData = [
            {
                recordId: "685669a6a65b0465dea203b1",
                correctAmount: 600,
                correctDescription: "User claims Micro Hash earnings 600",
                minerType: "Micro Hash"
            },
            {
                recordId: "6858f294a65b0465dea24dca",
                correctAmount: 1200,
                correctDescription: "User claims Micro Hash earnings 1200",
                minerType: "Micro Hash"
            },
            {
                recordId: "6848d4eba65b0465de9ff745",
                correctAmount: 3150,
                correctDescription: "User claims Mega Hash earnings 3150",
                minerType: "Mega Hash"
            },
            {
                recordId: "6853e1b5a65b0465dea19a77",
                correctAmount: 600,
                correctDescription: "User claims Micro Hash earnings 600",
                minerType: "Micro Hash"
            },
            {
                recordId: "6857c8d1a65b0465dea22ff6",
                correctAmount: 600,
                correctDescription: "User claims Micro Hash earnings 600",
                minerType: "Micro Hash"
            },
            {
                recordId: "681ca4f23528a444dde236df",
                correctAmount: 22000,
                correctDescription: "User claims Giga Hash earnings 22000",
                minerType: "Giga Hash"
            },
            {
                recordId: "68246a7e3528a444dde2a0a7",
                correctAmount: 22000,
                correctDescription: "User claims Giga Hash earnings 22000",
                minerType: "Giga Hash"
            },
            {
                recordId: "685143e3a65b0465dea10af5",
                correctAmount: 1200,
                correctDescription: "User claims Mega Hash earnings 1200",
                minerType: "Mega Hash"
            },
            {
                recordId: "685b3a2ea65b0465dea2a332",
                correctAmount: 600,
                correctDescription: "User claims Micro Hash earnings 600",
                minerType: "Micro Hash"
            },
            {
                recordId: "68537efaa65b0465dea17e97",
                correctAmount: 3600,
                correctDescription: "User claims Micro Hash earnings 3600",
                minerType: "Micro Hash"
            },
            {
                recordId: "682ab719a65b0465de9c46fe",
                correctAmount: 1500,
                correctDescription: "User claims Mega Hash earnings 1500",
                minerType: "Mega Hash"
            },
            {
                recordId: "68428e61a65b0465de9f4812",
                correctAmount: 1500,
                correctDescription: "User claims Mega Hash earnings 1500",
                minerType: "Mega Hash"
            },
            {
                recordId: "683fabf1a65b0465de9ece15",
                correctAmount: 600,
                correctDescription: "User claims Micro Hash earnings 600",
                minerType: "Micro Hash"
            },
            {
                recordId: "68527f90a65b0465dea14b15",
                correctAmount: 1500,
                correctDescription: "User claims Mega Hash earnings 1500",
                minerType: "Mega Hash"
            },
            {
                recordId: "684e8120a65b0465dea0c198",
                correctAmount: 1500,
                correctDescription: "User claims Mega Hash earnings 1500",
                minerType: "Mega Hash"
            },
            {
                recordId: "683daa2ba65b0465de9e8876",
                correctAmount: 11000,
                correctDescription: "User claims Giga Hash earnings 11000",
                minerType: "Giga Hash"
            },
            {
                recordId: "685168d0a65b0465dea11584",
                correctAmount: 3000,
                correctDescription: "User claims Mega Hash earnings 3000",
                minerType: "Mega Hash"
            },
            {
                recordId: "685d007aa65b0465dea304f5",
                correctAmount: 600,
                correctDescription: "User claims Micro Hash earnings 600",
                minerType: "Micro Hash"
            }
        ];

        const session = await mongoose.startSession();
        session.startTransaction();

        let updatedCount = 0;
        let errors = [];

        for (const fixItem of fixData) {
            try {
                console.log(`Processing record ID: ${fixItem.recordId}...`);

                // First, try to find in Analytics collection by _id
                let analyticsRecord = await Analytics.findById(fixItem.recordId).session(session);
                
                // If not found by _id, try to find by transactionid
                if (!analyticsRecord) {
                    analyticsRecord = await Analytics.findOne({ transactionid: fixItem.recordId }).session(session);
                }

                if (analyticsRecord) {
                    // Update Analytics record
                    const analyticsResult = await Analytics.findByIdAndUpdate(
                        analyticsRecord._id,
                        { 
                            $set: { 
                                amount: fixItem.correctAmount,
                                description: fixItem.correctDescription,
                                type: `Claim ${fixItem.minerType}`
                            }
                        },
                        { session, returnDocument: "after" }
                    );

                    console.log(`Updated Analytics for record ${fixItem.recordId}: amount ${fixItem.correctAmount}`);

                    // Update Inventory History by _id
                    const inventoryHistoryResult = await Inventoryhistory.findByIdAndUpdate(
                        fixItem.recordId,
                        { 
                            $set: { 
                                amount: fixItem.correctAmount,
                                type: `Claim ${fixItem.minerType}`
                            }
                        },
                        { session, returnDocument: "after" }
                    );

                    if (inventoryHistoryResult) {
                        console.log(`Updated Inventory History for record ${fixItem.recordId}`);
                    }

                    // Update the most recent Wallet History for this user
                    const walletHistoryResult = await Wallethistory.findOneAndUpdate(
                        { 
                            owner: analyticsRecord.owner,
                            type: "minecoinwallet"
                        },
                        { 
                            $set: { 
                                amount: fixItem.correctAmount,
                                minername: fixItem.minerType
                            }
                        },
                        { session, sort: { createdAt: -1 }, returnDocument: "after" }
                    );

                    if (walletHistoryResult) {
                        console.log(`Updated Wallet History for user ${analyticsRecord.owner}`);
                    }

                    updatedCount++;
                    console.log(`✅ Successfully updated record ${fixItem.recordId}`);
                } else {
                    const error = `Record ID ${fixItem.recordId} not found in Analytics collection`;
                    errors.push(error);
                    console.log(`❌ ${error}`);
                }
            } catch (error) {
                const errorMsg = `Error updating record ${fixItem.recordId}: ${error.message}`;
                errors.push(errorMsg);
                console.log(`❌ ${errorMsg}`);
            }
        }

        if (errors.length > 0) {
            console.log('\n❌ Errors encountered:');
            errors.forEach(error => console.log(`  - ${error}`));
            await session.abortTransaction();
            console.log(`\n⚠️  Transaction aborted. Updated ${updatedCount} out of ${fixData.length} records before errors occurred.`);
        } else {
            await session.commitTransaction();
            console.log(`\n✅ Successfully updated all ${updatedCount} out of ${fixData.length} records!`);
        }

        session.endSession();

    } catch (err) {
        console.error('❌ Error fixing analytics data:', err);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
    }
}

// Run the fix function
fixAnalyticsData();
