const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth.js");

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { roles: true }
    });
    
    if (user.roles.some(role => role.name === 'admin')) {
      next();
    } else {
      res.status(403).json({ message: "Accès refusé: droits d'administrateur requis" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Créer un nouveau rôle
router.post('/roles', 
  auth, 
  isAdmin,
  [body('name').notEmpty().trim()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const role = await prisma.role.create({
        data: { name: req.body.name }
      });
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
});

// Assigner un rôle à un utilisateur
router.post('/users/:userId/roles/:roleId',
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const { userId, roleId } = req.params;
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          roles: { connect: { id: parseInt(roleId) } }
        }
      });
      res.json({ message: "Rôle assigné avec succès" });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
});

// Créer une nouvelle permission
router.post('/permissions',
  auth,
  isAdmin,
  [body('name').notEmpty().trim()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const permission = await prisma.permission.create({
        data: { name: req.body.name }
      });
      res.json(permission);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
});

// Assigner une mission à un utilisateur
router.post('/users/:userId/missions',
  auth,
  isAdmin,
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const mission = await prisma.mission.create({
        data: {
          title: req.body.title,
          description: req.body.description,
          userId: parseInt(req.params.userId)
        }
      });
      res.json(mission);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
});

module.exports = router;