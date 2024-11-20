import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth, isAdmin } from "../middleware/auth.js";
import createResponse from "../utils/responseHandler.js";

const router = express.Router();
const prisma = new PrismaClient();

// Route GET pour récupérer tous les utilisateurs avec leurs todos et rôles
router.get("/all", auth, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.status(200).json(createResponse(
      true,
      users,
      "Utilisateurs récupérés avec succès"
    ));
  } catch (error) {
    console.error(error);
    res.status(500).json(createResponse(
      false,
      null,
      "Une erreur est survenue lors de la récupération des utilisateurs"
    ));
  }
});

// Route GET pour récupérer toutes les todos d'un utilisateur spécifique
router.get("/:id/todos", auth, isAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const userTodos = await prisma.todo.findMany({
      where: {
        userId: userId
      }
    });

    res.status(200).json(createResponse(
      true,
      userTodos,
      "Todos de l'utilisateur récupérées avec succès"
    ));
  } catch (error) {
    console.error(error);
    res.status(500).json(createResponse(
      false,
      null,
      "Une erreur est survenue lors de la récupération des todos"
    ));
  }
});

export default router;