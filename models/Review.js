const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema (
    {
        ride:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Ride",
            required:true,
            unique:true
        },

        rider:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            require:true
        },

        driver:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user",
            required:true
        },

        rating:{
            type:Number,
            min:1,
            max:5,
            required:true
        },

        comment:{
            type:String,
            maxlength:500
        },
    },

    {timestamps:true}
);

module.exports = mongoose.model("Review", reviewSchema)