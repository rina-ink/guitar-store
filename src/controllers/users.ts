import type { RequestHandler } from "express";
import User from "../models/User.ts";
import type { UserInput } from "../schemas/userSchemas.ts";

export const getUsers: RequestHandler = async (_req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json(users);
    } catch (error: unknown) {
        next(error);   // sends unexpected errors to errorHandler
    }
};

export const createUser: RequestHandler = async (req, res, next) => {
    try {
        const { name, email, password } = req.body as UserInput;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists",
            });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        res.status(201).json(user);
    } catch (error: unknown) {
        next(error);
    }
};

export const getUserById: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json(user);
    } catch (error: unknown) {
        next(error);
    }
};

export const updateUser: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body as UserInput;

        const existingUser = await User.findOne({
            email,
            _id: { $ne: id },   // find another user with this email, but ignore the user currently being updated
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists",
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.name = name;
        user.email = email;
        user.password = password;

        await user.save();

        res.status(200).json(user);
    } catch (error: unknown) {
        next(error);
    }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            message: "User deleted successfully",
        });
    } catch (error: unknown) {
        next(error);
    }
};


/* RequestHandler? It's a TypeScript type provided by Expres
import type - only TypeScript uses this. It disappears after compilation.

.

$ne means not equal */