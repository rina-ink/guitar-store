import type { RequestHandler } from "express";
import Product from "../models/Product.ts";
import type { ProductInput } from "../schemas/productSchemas.ts";   // tells typeScript what structure req.body should have
import Category from "../models/Category.ts";

export const getProducts: RequestHandler = async (_req, res, next) => {
    try {
        // const products = await Product.find();   // asks MongoDB for all product documents
        const products = await Product.find().populate(
            "category",
            "name description"
        );

        res.status(200).json(products);   // sends the products to the client as JSON
    } catch (error: unknown) {
        next(error);
    }
};

export const getProductById: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;   // extracts id from the route parameters

        // const product = await Product.findById(id);
        const product = await Product.findById(id).populate(
            "category",
            "name description"
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json(product);
    } catch (error: unknown) {
        next(error);
    }
};

export const createProduct: RequestHandler = async (req, res, next) => {   // creates the controller used for a request such as: POST/products 
    try {
        const productData = req.body as ProductInput;   // stores the request body in a variable productData
        
        const category = await Category.findById(productData.category);
        
        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        const product = await Product.create(productData);   // creates a new mongoose product document and saves it in MongoDB - Mongoose stores it in the products collection
        
        await product.populate("category", "name description");

        res.status(201).json(product);   // returns the newly created product
    } catch (error: unknown) {
        next(error);
    }
};

export const updateProduct: RequestHandler = async (req, res, next) => {   // PUT/products/:id
    try {
        const { id } = req.params;
        const productData = req.body as ProductInput;

        const category = await Category.findById(productData.category);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            productData,   // argument: what values should be applied?
            {
                new: true,   // means mongoose returns the updated product, not the old version
                runValidators: true,   // means run the mongoose schema validation rules on the update
            }
        ).populate("category", "name description");

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json(product);
    } catch (error: unknown) {
        next(error);
    }
};

export const deleteProduct: RequestHandler = async (req, res, next) => {   // creates the controller used to delete a product
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json({
            message: "Product deleted successfully",
        });
    } catch (error: unknown) {
        next(error);
    }
};


/* this file contains the CRUD controller functions for products:
create
read
update
delete */