const mongoose = require ('mongoose');
const bcrypt =  require ('bcryptjs');

const useschema =  new mongoose.Schema(
    {
        name:{
            type:String,
            Required:true,
            trim:true
        },


        email:{
            type :String,
            Required:true,
            unique:true,
            lowercase:true
        },

        password:{

            type:String,
            required:true,
            minlength:6
        },

        role: {
            type:String,
            enum:["rider","driver","admin"],
            default:"rider"
        },

        phone:String,

        rating:{
            type:Number,
            default:5
        },

        totalRatings:{
            type:Number,
            default:0
        },


        isAvailable:{
            type:Boolean,
            default:false
        },

        currentLocation: {
         type:{
            type:String,
            eum:["point"],
         },

         corrdinaltes:{
            type:[Number],
            default:[0,0]
         }
        }


    },
     {timestamps: true}

);


userSchema:index({ currentLocation:"2dsplere"});

useschema.pre("save", async function (){
   if(!this.isModified("password")) return;
   

   const salt =  await bcrypt.getSalt(10);
   this.password = await bcrypt.hash(this.password,salt);
});


userSchema.method.comparePassword =  async function (password) {

    return bcrypt.compare(password , this.password);
};

module.exports = mongoose.model("User",userSchema);