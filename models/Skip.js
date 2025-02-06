const { default: mongoose } = require("mongoose");


const SkipSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            index: true // Automatically creates an index on 'amount'
        },
        skip: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const Skip = mongoose.model("Skip", SkipSchema);
module.exports = Skip