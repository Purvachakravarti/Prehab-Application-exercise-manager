import bcrypt from "bcrypt";
import { Request, Response } from "express";
import User from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;

// Create User
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await User.create({ username, password: hashedPassword });
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    if (error instanceof Error) {
      console.error("An error occurred:", error.message);
    } else {
      console.error("An unexpected error occurred:", error);
    }
  }
};

// Authenticate User
export const authenticateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    res.json({ accessToken, refreshToken, userId: user.id });
  } catch (error) {
    if (error instanceof Error) {
      console.error("An error occurred:", error.message);
    } else {
      console.error("An unexpected error occurred:", error);
    }
  }
};

// Refresh Token
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { refreshToken } = req.body;
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
    if (typeof payload === "object" && "userId" in payload) {
      const newAccessToken = generateAccessToken(payload.userId);
      res.json({ accessToken: newAccessToken, userId: payload.userId });
      console.log("UserId:", payload.userId); // Access the userId safely
    }
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};
