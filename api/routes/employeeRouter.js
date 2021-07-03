const express = require("express");
const {
  validator,
  validateManager,
} = require("../middlewares/validationMiddleware.js");
const UserHelper = require("../models/userModel.js");

const router = express.Router();

//get all employees of department if you are the manager of department
router.get(
  "/employees/:department",
  validator,
  validateManager,
  async (req, res) => {
    try {
      const { department } = req.params;
      const [requestingUser] = await UserHelper.findUserByID(req.UserId);
      if (requestingUser.department != department) {
        res.status(401).json({
          message:
            "You must be the department manager to view these employees. Contact support for more information.",
        });
      } else {
        const employees = await UserHelper.getAllUsersByDepartment(department);
        res.status(200).json({ message: "Success", data: employees });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Server Error", error_message: error.message });
    }
  }
);

//account update
router.put("/account/:userId", validator, async (req, res) => {
  const { userId } = req.params;
  const userAccount = parseInt(userId);
  const { role, id } = req.Decoded;
  const changes = req.body;

  try {
    const [user] = await UserHelper.findUserByID(userId);
    if (!user) {
      res.status(400).json({
        message:
          "Requested User does not exist, please be sure the email is correct.",
      });
    } else if (id === userAccount || role === 1328) {
      const updatedUser = await UserHelper.updateUser(id, changes);
      res
        .status(201)
        .json({ message: "Account updated successfully.", data: updatedUser });
    } else {
      res.status(401).json({
        message: "You do not have permission to edit this account.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message:
        "Error on Server, changes not accepted please contact support with error message.",
      error_message: error.message,
    });
  }
});

module.exports = router;
