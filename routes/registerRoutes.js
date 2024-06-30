const express = require("express");
const router = express.Router();

const registerController = require("../controllers/userRegisterController");


router.post("/signup", registerController.createUserRegister);
router.post("/signin", registerController.loginUser);

router.post("/appointments",registerController.createAppointment);
router.get("/appointments/:email",registerController.getAllUserAppointments);

module.exports = router;
