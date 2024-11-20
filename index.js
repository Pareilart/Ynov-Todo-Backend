import express from "express";
import cors from 'cors';
import userRoutes from "./routes/userRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/admin/users', adminUserRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
