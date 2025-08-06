const express = require('express');
const router = express.Router();
const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

// SIGNUP
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate role, fallback to USER
    let userRole = Role.USER;
    if (role && Object.values(Role).includes(role)) {
      userRole = role; // e.g., "MANAGER" or "ADMIN"
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole
      }
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
});


// ✅ LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
  message: 'Login successful',
  token,
  role: user.role,   // ✅ Send role explicitly
  userId: user.id    // ✅ Send userId explicitly
});

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
});

module.exports = router;
