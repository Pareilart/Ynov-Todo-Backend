const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      // Récupérer l'utilisateur avec ses rôles et leurs permissions
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: {
          roles: {
            include: {
              permissions: true
            }
          }
        }
      });

      // Vérifier si l'utilisateur a la permission requise dans l'un de ses rôles
      const hasPermission = user.roles.some(role =>
        role.permissions.some(permission => permission.name === permissionName)
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: "Vous n'avez pas la permission nécessaire pour effectuer cette action" 
        });
      }

      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  };
};

module.exports = checkPermission; 