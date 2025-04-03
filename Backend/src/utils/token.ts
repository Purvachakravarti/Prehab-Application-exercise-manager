import jwt from "jsonwebtoken";

const generateAccessToken = (userId: number): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "15m" });
};

const generateRefreshToken = (userId: number): string => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });
};

const verifyToken = (token: string, secret: string): any => {
  return jwt.verify(token, secret);
};

export { generateAccessToken, generateRefreshToken, verifyToken };
