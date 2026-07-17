import type { ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validateBody = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);   // validates req.body using the zod schema

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid input",
                errors: result.error.issues,
            });
        }

        req.body = result.data;   // runs only when validation succeeds
        next();
    };
};


/* Zod validates data, before it reaches the controller or MongoDB

zod checks and cleans incoming request data
controller performs the requested operation
mongoose schema protects the database and defines stored documents

zod and mongoose validation overlap slightly, but they work at different stages. 
zod gives the client an early, clear 400 response; 
mongoose remains the final database-level safeguard */