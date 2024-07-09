
const router = require("express").Router();
const { getNoty } = require("../controllers/notyControllers");


router.get("/getNoty", getNoty);


module.exports = router;

