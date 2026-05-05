import jwt from "jsonwebtoken";

export const signToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
