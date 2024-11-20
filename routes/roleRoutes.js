import express from "express";
const router = express.Router();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { body, validationResult } from "express-validator";
import { auth, isAdmin } from "../middleware/auth.js";
import createResponse from "../utils/responseHandler.js";

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
        return res.status(400).json(createResponse(false, null, errors.array()));
      }

      const existingRole = await prisma.role.findFirst({
        where: { name: req.body.name },
      });

      if (existingRole) {
        return res.status(400).json(
          createResponse(false, null, "Un rôle avec ce nom existe déjà")
        );
      }

      const role = await prisma.role.create({
        data: { name: req.body.name },
      });
      res.json(createResponse(true, role, "Rôle créé avec succès"));
    } catch (error) {
      res.status(500).json(
        createResponse(false, null, "Erreur serveur")
      );
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
      return res.status(404).json(
        createResponse(false, null, "Utilisateur non trouvé")
      );
    }

    // Vérifier si le rôle existe
    const role = await prisma.role.findUnique({
      where: { id: parseInt(roleId) },
    });

    if (!role) {
      return res.status(404).json(
        createResponse(false, null, "Rôle non trouvé")
      );
    }

    // Vérifier si le rôle est déjà assigné
    const roleAlreadyAssigned = user.roles.some(
      (r) => r.id === parseInt(roleId)
    );
    if (roleAlreadyAssigned) {
      return res.status(400).json(
        createResponse(false, null, "Le rôle est déjà assigné à cet utilisateur")
      );
    }

    // Assigner le rôle
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        roles: { connect: { id: parseInt(roleId) } },
      },
    });

    res.json(createResponse(true, null, "Rôle assigné avec succès"));
  } catch (error) {
    res.status(500).json(
      createResponse(false, null, "Erreur serveur")
    );
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
        return res.status(400).json(createResponse(false, null, errors.array()));
      }

      // Vérifier si la permission existe déjà
      const existingPermission = await prisma.permission.findFirst({
        where: { name: req.body.name },
      });

      if (existingPermission) {
        return res.status(400).json(
          createResponse(false, null, "Une permission avec ce nom existe déjà")
        );
      }

      const permission = await prisma.permission.create({
        data: { name: req.body.name },
      });
      res.json(createResponse(true, permission, "Permission créée avec succès"));
    } catch (error) {
      res.status(500).json(
        createResponse(false, null, "Erreur serveur")
      );
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
      return res.status(404).json(
        createResponse(false, null, "Rôle non trouvé")
      );
    }

    // Vérifier si la permission existe
    const permission = await prisma.permission.findUnique({
      where: { id: parseInt(permissionId) },
    });

    if (!permission) {
      return res.status(404).json(
        createResponse(false, null, "Permission non trouvée")
      );
    }

    // Vérifier si la permission est déjà assignée au rôle
    const permissionAlreadyAssigned = role.permissions.some(
      (p) => p.id === parseInt(permissionId)
    );
    if (permissionAlreadyAssigned) {
      return res.status(400).json(
        createResponse(false, null, "La permission est déjà assignée à ce rôle")
      );
    }

    // Assigner la permission au rôle
    await prisma.role.update({
      where: { id: parseInt(roleId) },
      data: {
        permissions: { connect: { id: parseInt(permissionId) } },
      },
    });

    res.json(createResponse(true, null, "Permission assignée avec succès"));
  } catch (error) {
    res.status(500).json(
      createResponse(false, null, "Erreur serveur")
    );
  }
});

export default router;
