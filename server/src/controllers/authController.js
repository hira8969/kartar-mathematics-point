import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";

export const login = async (req, res) => {
  const identifier = (req.body.identifier || req.body.email)?.trim().toLowerCase();
  const password = req.body.password;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: identifier });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.isSuspended) {
    return res.status(403).json({ message: "Account suspended" });
  }

  if (!user.isApproved) {
    return res.status(403).json({ message: "Account approval pending. Please contact admin." });
  }

  res.json({
    token: signToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      studentClass: user.studentClass,
      subjectsTaught: user.subjectsTaught
    }
  });
};

export const me = async (req, res) => {
  res.json(req.user);
};
