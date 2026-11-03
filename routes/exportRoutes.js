const express = require("express");

const protect =  require("../middleware/auth");

const {exportCSV} =  require ("../controllers/exportController");

const router =  express.Router();

router.get("/rides/csv",protect,exportCSV);

module.exports = router;