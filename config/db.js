const mongoose = require('mongoose');

const ConnectDB = async() => {
    try {
        await mongoose .connect(process.env.MONGO_URI);
        console.log("mongodb is connected ");
    }catch (e) {
          console.log("MongoDB Error :",e.message);
          process.exit(1);
    }
};

module.exports = ConnectDB;