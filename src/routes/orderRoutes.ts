import { Router } from "express";
import { createOrder } from "../controllers/orders.ts";
import { validateBody } from "../middleware/validateBody.ts";
import { orderInputSchema } from "../schemas/orderSchemas.ts";

const orderRouter = Router();

orderRouter.post(
    "/",
    validateBody(orderInputSchema),
    createOrder
);

export default orderRouter;