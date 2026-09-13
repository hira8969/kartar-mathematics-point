import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

export const signToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
      role: user.role,
      name: user.name
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );

export { getJwtSecret };
