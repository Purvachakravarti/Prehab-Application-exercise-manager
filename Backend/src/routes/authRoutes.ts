import { Router } from "express";
import {
  createUser,
  authenticateUser,
  refreshToken,
} from "../controllers/authController";
import { body } from "express-validator";

const router = Router();

router.post(
  "/signup",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  createUser
);

router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authenticateUser
);

router.post("/refresh", refreshToken);

export default router;
