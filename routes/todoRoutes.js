const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");
const { auth, isAdmin } = require("../middleware/auth.js");
const checkPermission = require("../middleware/checkPermission.js");
const { createResponse } = require("../utils/responseHandler");

// Au début du fichier, après les imports
const TODO_STATUS = {
  EN_ATTENTE: 'EN_ATTENTE',
  EN_COURS: 'EN_COURS',
  TERMINEE: 'TERMINEE',
  ARCHIVEE: 'ARCHIVEE',
};

// Route pour obtenir les todos de l'utilisateur connecté
router.get("/", auth, async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId: req.userId,
      },
    });
    res.json(createResponse(true, todos, "Todos récupérés avec succès"));
  } catch (error) {
    console.error(error);
    res.status(500).json(
      createResponse(false, null, "Une erreur est survenue lors de la récupération des todos.")
    );
  }
});

// Route POST pour créer un Todo
router.post(
  "/create",
  auth,
  [
    body("title").notEmpty().withMessage("Le titre est obligatoire."),
    body("status")
      .isIn(Object.values(TODO_STATUS))
      .withMessage("Le statut doit être EN_ATTENTE, EN_COURS ou TERMINEE")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createResponse(false, errors.array(), "Validation échouée"));
    }

    const { title, status } = req.body;

    try {
      // Création du todo dans la base de données
      const todo = await prisma.todo.create({
        data: {
          title,
          userId: req.userId,
          status,
        },
      });
      res.status(201).json(createResponse(true, todo, "Todo créé avec succès"));
    } catch (error) {
      console.error(error);
      res.status(500).json(
        createResponse(false, null, "Une erreur est survenue lors de la création du todo.")
      );
    }
  }
);

// Route DELETE pour supprimer un todo
router.delete(
  "/delete/:id", 
  auth, 
  isAdmin, 
  checkPermission('delete:todos'),
  async (req, res) => {
    try {
      const todo = await prisma.todo.delete({
        where: {
          id: parseInt(req.params.id),
        },
      });
      
      res.json(createResponse(true, todo, "Todo supprimé avec succès"));
    } catch (error) {
      console.error(error);
      res.status(500).json(
        createResponse(false, null, "Une erreur est survenue lors de la suppression du todo.")
      );
    }
  }
);

// Route PUT pour mettre à jour un todo
router.put(
  "/update/:id",
  auth,
  [body("title").notEmpty().withMessage("Le titre est obligatoire.")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createResponse(false, errors.array(), "Validation échouée"));
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
      res.status(200).json(createResponse(true, todo, "Todo mis à jour avec succès"));
    } catch (error) {
      console.error(error);
      res.status(500).json(
        createResponse(false, null, "Une erreur est survenue lors de la mise à jour du todo.")
      );
    }
  }
);

// Route PATCH pour basculer l'état de complétion d'un todo
router.patch(
  "/toggle-completion/:id",
  auth,
  async (req, res) => {
    try {
      const todoId = parseInt(req.params.id);
      
      // Récupérer d'abord le todo actuel
      const currentTodo = await prisma.todo.findUnique({
        where: {
          id: todoId,
          userId: req.userId,
        },
      });

      if (!currentTodo) {
        return res.status(404).json(
          createResponse(false, null, "Todo non trouvé")
        );
      }

      // Basculer la valeur du booléen completed
      const todo = await prisma.todo.update({
        where: {
          id: todoId,
          userId: req.userId,
        },
        data: {
          completed: !currentTodo.completed,
        },
      });

      res.json(createResponse(true, todo, "État de complétion du todo mis à jour avec succès"));
    } catch (error) {
      console.error(error);
      res.status(500).json(
        createResponse(false, null, "Une erreur est survenue lors de la mise à jour de l'état de complétion du todo.")
      );
    }
  }
);

// Route PATCH pour mettre à jour le statut d'un todo
router.patch(
  "/updateStatus/:id",
  auth,
  [
    body("status").isIn(Object.values(TODO_STATUS)).withMessage("Le nouveau statut est invalide")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createResponse(false, errors.array(), "Validation échouée"));
    }

    try {
      const todoId = parseInt(req.params.id);
      const { status: newStatus } = req.body;

      const todo = await prisma.todo.findUnique({
        where: {
          id: todoId,
          userId: req.userId,
        },
      });

      if (!todo) {
        return res.status(404).json(createResponse(false, null, "Todo non trouvé"));
      }

      if (todo.status === newStatus) {
        return res.status(400).json(
          createResponse(false, null, "Le nouveau statut doit être différent du statut actuel")
        );
      }

      const updatedTodo = await prisma.todo.update({
        where: {
          id: todoId,
          userId: req.userId,
        },
        data: {
          status: newStatus,
        },
      });

      res.json(createResponse(true, updatedTodo, "Statut du todo mis à jour avec succès"));
    } catch (error) {
      console.error(error);
      res.status(500).json(
        createResponse(false, null, "Une erreur est survenue lors de la mise à jour du statut du todo.")
      );
    }
  }
);

module.exports = router;
