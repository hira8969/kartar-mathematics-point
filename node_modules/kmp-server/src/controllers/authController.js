import { User } from "../models/User.js";
import { ROLES } from "../constants.js";
import { signToken } from "../utils/jwt.js";

export const register = async (req, res) => {
  const { name, email, phone, password, role, studentClass, subjectsTaught } = req.body;

  if (role === ROLES.ADMIN) {
    return res.status(403).json({ message: "Admin accounts require super admin access" });
  }

  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedPhone = phone?.trim();

  const filters = [{ phone: normalizedPhone }];
  if (normalizedEmail) {
    filters.push({ email: normalizedEmail });
  }

  const existingUser = await User.findOne({ $or: filters });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({
    name: name?.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    password,
    role,
    studentClass,
    subjectsTaught
  });

  res.status(201).json({
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

export const login = async (req, res) => {
  const identifier = req.body.identifier?.trim();
  const password = req.body.password;
  const emailValue = typeof identifier === "string" ? identifier.toLowerCase() : identifier;

  const user = await User.findOne({
    $or: [{ email: emailValue }, { phone: identifier }]
  });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.isSuspended) {
    return res.status(403).json({ message: "Account suspended" });
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
