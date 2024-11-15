const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");
const { auth, isAdmin } = require("../middleware/auth.js");

// Créer un nouveau rôle
router.post(
  "/create",
  auth,
  isAdmin,
  [body("name").notEmpty().trim()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Vérifier si le rôle existe déjà
      const existingRole = await prisma.role.findFirst({
        where: { name: req.body.name },
      });

      if (existingRole) {
        return res
          .status(400)
          .json({ message: "Un rôle avec ce nom existe déjà" });
      }

      const role = await prisma.role.create({
        data: { name: req.body.name },
      });
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
  }
);

// Assigner un rôle à un utilisateur
router.post("/users/:userId/role/:roleId", auth, isAdmin, async (req, res) => {
  try {
    const { userId, roleId } = req.params;

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { roles: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si le rôle existe
    const role = await prisma.role.findUnique({
      where: { id: parseInt(roleId) },
    });

    if (!role) {
      return res.status(404).json({ message: "Rôle non trouvé" });
    }

    // Vérifier si le rôle est déjà assigné
    const roleAlreadyAssigned = user.roles.some(
      (r) => r.id === parseInt(roleId)
    );
    if (roleAlreadyAssigned) {
      return res
        .status(400)
        .json({ message: "Le rôle est déjà assigné à cet utilisateur" });
    }

    // Assigner le rôle
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        roles: { connect: { id: parseInt(roleId) } },
      },
    });

    res.json({ message: "Rôle assigné avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// Créer une nouvelle permission
router.post(
  "/permissions/create",
  auth,
  isAdmin,
  [body("name").notEmpty().trim()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Vérifier si la permission existe déjà
      const existingPermission = await prisma.permission.findFirst({
        where: { name: req.body.name },
      });

      if (existingPermission) {
        return res
          .status(400)
          .json({ message: "Une permission avec ce nom existe déjà" });
      }

      const permission = await prisma.permission.create({
        data: { name: req.body.name },
      });
      res.json(permission);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
  }
);

// Assigner une permission à un rôle
router.post("/permission/:permissionId/role/:roleId", auth, isAdmin, async (req, res) => {
  try {
    const { roleId, permissionId } = req.params;

    // Vérifier si le rôle existe
    const role = await prisma.role.findUnique({
      where: { id: parseInt(roleId) },
      include: { permissions: true },
    });

    if (!role) {
      return res.status(404).json({ message: "Rôle non trouvé" });
    }

    // Vérifier si la permission existe
    const permission = await prisma.permission.findUnique({
      where: { id: parseInt(permissionId) },
    });

    if (!permission) {
      return res.status(404).json({ message: "Permission non trouvée" });
    }

    // Vérifier si la permission est déjà assignée au rôle
    const permissionAlreadyAssigned = role.permissions.some(
      (p) => p.id === parseInt(permissionId)
    );
    if (permissionAlreadyAssigned) {
      return res
        .status(400)
        .json({ message: "La permission est déjà assignée à ce rôle" });
    }

    // Assigner la permission au rôle
    await prisma.role.update({
      where: { id: parseInt(roleId) },
      data: {
        permissions: { connect: { id: parseInt(permissionId) } },
      },
    });

    res.json({ message: "Permission assignée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

module.exports = router;