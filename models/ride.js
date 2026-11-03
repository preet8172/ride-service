const mongoose = require("mongoose");

const locationSchema =  new mongoose.Schema(
    {
        address:String,

        coordinates:{
            type:[Number],
            require:true
        }
    },
    {_id:false}
);

const rideSchema = new mongoose.Schema(
    {
        rider:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user",
            required:true
        },

        driver:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user",
            default:null
        },

        pickup:{
            type:locationSchema,
            required:true
        },

        destination:{
            type:locationSchema,
            required:true
        },

        distance:{

            type:Number,
            default:0
        },

        duration:{
            type:Number,
            default:0
        },


        estimatedFare:{
            type:Number,
            default:0
        },

        finalfare:{
            type:Number,
            default:0
        },


        status:{
            type:String,
            enum:["requested","accepted","arriving","started","completed","cancelled"],
            default:"requested"
        },

        requestedAt:{
            type:Date,
            default: Date.now
        },


        acceptedAt:Date,
        startedAt:Date,
        completedAt:Date
    },

    { timestamps: true}
);

module.exports = mongoose.model("Ride", rideSchema);