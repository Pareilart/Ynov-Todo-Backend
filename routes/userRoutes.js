const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { auth } = require("../middleware/auth.js");
// Route GET pour récupérer tous les utilisateurs avec leurs todos et rôles
router.get("/me", auth, async (req, res) => {
  try {
    // Récupérer tous les utilisateurs avec leurs todos et rôles
    const users = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        todos: true,
        roles: true
      }
    });

    // Retourner la liste des utilisateurs
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error:
        "Une erreur est survenue lors de la récupération des utilisateurs.",
    });
  }
});

// Route POST pour créer un utilisateur avec validation
router.post(
  "/signup",
  [
    // Validation des champs
    body("name").notEmpty().withMessage("Le nom est obligatoire."),
    body("email")
      .isEmail()
      .withMessage("L'email doit être valide.")
      .notEmpty()
      .withMessage("L'email est obligatoire."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Le mot de passe doit avoir au moins 6 caractères.")
      .notEmpty()
      .withMessage("Le mot de passe est obligatoire."),
  ],
  async (req, res) => {
    // Vérification des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Vérification de l'unicité de l'email
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: "L'email est déjà utilisé." });
      }

      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Création de l'utilisateur
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Retourner l'utilisateur créé sans le mot de passe
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Une erreur est survenue." });
    }
  }
);

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérification si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "Utilisateur non trouvé" });
    }

    // Comparaison du mot de passe avec le mot de passe haché
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Mot de passe incorrect" });
    }

    // Génération du JWT sécurisé avec un algorithme sécurisé
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
      algorithm: "HS256",
    });

    // Générer un refresh token pour renouveler le JWT
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d", 
      algorithm: "HS256",
    });

    // Retourner le token et le refresh token dans la réponse
    res.status(200).json({
      message: "Connexion réussie",
      token,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Une erreur est survenue." });
  }
});

module.exports = router;
