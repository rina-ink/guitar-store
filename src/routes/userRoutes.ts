import { Router } from "express";
import {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    updateUser,
} from "../controllers/users.ts";
import { validateBody } from "../middleware/validateBody.ts";
import { userInputSchema } from "../schemas/userSchemas.ts";

const userRoutes = Router();

userRoutes.get("/", getUsers);

userRoutes.post(
    "/",
    validateBody(userInputSchema),
    createUser
);

userRoutes.get("/:id", getUserById);

userRoutes.put(
    "/:id",
    validateBody(userInputSchema),
    updateUser
);

userRoutes.delete("/:id", deleteUser);

export default userRoutes;