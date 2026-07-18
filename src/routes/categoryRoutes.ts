import { Router } from "express";
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/categories.ts";
import { validateBody } from "../middleware/validateBody.ts";
import { categoryInputSchema } from "../schemas/categorySchemas.ts";

const categoryRoutes = Router();

categoryRoutes.get("/", getCategories);

categoryRoutes.get("/:id", getCategoryById);

categoryRoutes.post(
    "/",
    validateBody(categoryInputSchema),
    createCategory
);

categoryRoutes.put(
    "/:id",
    validateBody(categoryInputSchema),
    updateCategory
);

categoryRoutes.delete("/:id", deleteCategory);

export default categoryRoutes;