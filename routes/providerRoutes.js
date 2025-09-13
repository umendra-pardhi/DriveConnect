const express = require("express");
const router = express.Router();
const providerController = require("../controllers/providerController");

// Create new provider
router.post("/register", providerController.register);

// Get all providers
// router.get("/", providerController.getAll);

// // Get provider by ID
// router.get("/:id", providerController.getById);

// // Update provider
// router.put("/:id", providerController.update);

// // Delete provider
// router.delete("/:id", providerController.remove);

module.exports = router;
