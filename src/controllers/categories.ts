import type { RequestHandler } from "express";
import Category from "../models/Category.ts";
import type { CategoryInput } from "../schemas/categorySchemas.ts";

export const getCategories: RequestHandler = async (_req, res, next) => {
    try {
        const categories = await Category.find();   // finds every document in the categories collection

        res.status(200).json(categories);   // sends the categories to the client as JSON
    } catch (error: unknown) {
        next(error);   // if the database operation fails, the error is passed to your centralized error middleware
    }
};

export const getCategoryById: RequestHandler = async (req, res, next) => {   // creates a controller that retrieves one category
    try {
        const { id } = req.params;

        const category = await Category.findById(id);   // asks MongoDB to find a category whose _id matches id

        if (!category) {
            return res.status(404).json({   // the return stops the controller immediately
                message: "Category not found",
            });
        }

        res.status(200).json(category);   // if the category exists, it is returned with 200 OK
    } catch (error: unknown) {
        next(error);
    }
};

export const createCategory: RequestHandler = async (req, res, next) => {
    try {
        const categoryData = req.body as CategoryInput;

        const existingCategory = await Category.findOne({   // duplicate-name protection
            name: categoryData.name,
        });

        if (existingCategory) {   // checks whether a category with that name already exists
            return res.status(409).json({
                message: "Category already exists",   // the return prevents the controller from continuing to Category.create()
            });
        }

        const category = await Category.create(categoryData);

        res.status(201).json(category);   // returns the created category
    } catch (error: unknown) {
        next(error);
    }
};

export const updateCategory: RequestHandler = async (req, res, next) => {   // PUT/categories/:id
    try {
        const { id } = req.params;   // gets the category ID from the URL
        const categoryData = req.body as CategoryInput;

        const existingCategory = await Category.findOne({
            name: categoryData.name,   // checks whether another category already uses the requested name
            _id: { $ne: id },   // but exclude the category currently being updated
        });

        if (existingCategory) {
            return res.status(409).json({
                message: "Category already exists",
            });
        }

        const category = await Category.findByIdAndUpdate(
            id,   // first argument: identifies which category should be updated
            categoryData,   // second argument: contains the new values
            {
                new: true,
                runValidators: true,   // third argument: contains mongoose update option
            }
        );

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        res.status(200).json(category);
    } catch (error: unknown) {
        next(error);
    }
};

export const deleteCategory: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        res.status(200).json({
            message: "Category deleted successfully",
        });
    } catch (error: unknown) {
        next(error);
    }
};


/* The category controller first checks for duplicates.
This makes sense because category names are usually expected to be unique. */