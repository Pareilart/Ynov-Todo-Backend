const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth.js");

// Route pour obtenir les todos de l'utilisateur connecté
router.get("/", auth, async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId: req.userId,
      },
    });
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la récupération des todos.",
    });
  }
});

// Route POST pour créer un Todo
router.post(
  "/create",
  auth,
  [
    body("title").notEmpty().withMessage("Le titre est obligatoire."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title } = req.body;

    try {
      // Création du todo dans la base de données
      const todo = await prisma.todo.create({
        data: {
          title,
          userId: req.userId,
        },
      });
      res.status(201).json(todo);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Une erreur est survenue lors de la création du todo.",
      });
    }
  }
);

// Route DELETE pour supprimer un todo
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const todo = await prisma.todo.delete({
      where: {
        id: parseInt(req.params.id),
        userId: req.userId,
      },
    });
    res.json({ message: "Todo supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la suppression du todo.",
    });
  }
});

// Route PUT pour mettre à jour un todo
router.put(
  "/update/:id",
  auth,
  [
    body("title").notEmpty().withMessage("Le titre est obligatoire."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title } = req.body;

    try {
      const todo = await prisma.todo.update({
        where: {
          id: parseInt(req.params.id),
          userId: req.userId,
        },
        data: {
          title,
          userId: req.userId,
        },
      });
      res.status(200).json(todo);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Une erreur est survenue lors de la mise à jour du todo.",
      });
    }
  }
);

module.exports = router;
