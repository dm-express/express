import { Request, Response } from "express";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}${ext}`);
  },
});

export const upload = multer({ storage });

// POST /users/avatar
export const uploadAvatar = (req: Request, res: Response) => {
  // File is available as req.file
  // userId is available as req.body.userId
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({
    message: "Avatar uploaded successfully",
    file: req.file.filename,
    userId: req.body.userId,
  });
};
