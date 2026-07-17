import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (
    error,
    _req,
    res,
    _next
) => {
    console.error(error);

    if (error instanceof Error) {
        return res.status(500).json({
            message: error.message,
        });
    }

    res.status(500).json({
        message: "An unknown error occurred",
    });
};


/* The centralized handler handles unexpected failures, such as database connection problems
later - improve it with a custom error class

instead of repeating the complete error response in every controller - pass the error to the centralized middleware */


