const express = require("express");
const userRoutes = require("./routes/userRoutes");
const todoRoutes = require("./routes/todoRoutes");
const roleRoutes = require("./routes/roleRoutes");
const app = express();
app.use(express.json());

// Utilisation des routes avec le préfixe /api/
app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/roles', roleRoutes);
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
