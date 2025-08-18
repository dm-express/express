import { Router } from "express";
import * as userController from "../controllers/userController"; // business Logic is written over here
import { upload, uploadAvatar } from "../controllers/avatarController"; // file upload logic
import { authenticateToken } from "../middlewares/auth";

const router = Router();

// User CRUD
router.post("/", userController.createUser);
router.get("/", userController.getUsers);
router.get("/:id", userController.getUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// Auth
router.post("/login", userController.login);

// Avatar upload (protected)
router.post(
  // it checks the endpoint
  "/avatar",

  // first middleware
  authenticateToken,

  // 2nd middleware
  upload.single("avatar"),

  // main logic
  uploadAvatar
);

// Use Image Upload Services like Cloudinary
// Stores the image
// Returns a public url
// This public url can be stored in db

// Public Url takes less space in db

export default router;
