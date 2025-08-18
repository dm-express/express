import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = "your_jwt_secret"; // Use env var in production

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // If token is not present throw 401 unauthorised
  if (!token) return res.status(401).json({ message: "No token provided" });

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    // in the req body I am creating a new key user: userDetails
    (req as any).user = user;

    // move ahead to next function (middleware / function)
    next();
  });
}
