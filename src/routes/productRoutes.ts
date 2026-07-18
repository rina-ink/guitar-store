import { Router } from "express";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/products.ts";
import { validateBody } from "../middleware/validateBody.ts";
import { productInputSchema } from "../schemas/productSchemas.ts";

const productRoutes = Router();

productRoutes.get("/", getProducts);
productRoutes.get("/:id", getProductById);

productRoutes.post(
    "/",
    validateBody(productInputSchema),
    createProduct
);

productRoutes.put(
    "/:id",
    validateBody(productInputSchema),
    updateProduct
);

productRoutes.delete("/:id", deleteProduct);

export default productRoutes;