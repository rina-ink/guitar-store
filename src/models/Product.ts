import { Schema, model } from "mongoose";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: [2, "Product name must be at least 2 characters long"],
        },

        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },

        brand: {
            type: String,
            required: [true, "Brand is required"],
            trim: true,
        },

        category: {
            // type: String,
            type: Schema.Types.ObjectId,   // this tells Mongoose: store a MongoDB document ID here
            ref: "Category",   // that ID belongs to the Category collection
            required: [true, "Category is required"],
            trim: true,
        },

        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },

        stock: {
            type: Number,
            required: [true, "Stock is required"],
            min: [0, "Stock cannot be negative"],
            default: 0,
        },

        imageUrl: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
    }
);

export default model("Product", productSchema);


/* What establishes the relationship?
type: Schema.Types.ObjectId
The product stores a MongoDB document ID.

ref: "Category"
That ID is expected to refer to a document from the Category model. 

type: Schema.Types.ObjectId, unique identifier, represents a reference to another document
ref: "Category", this ObjectId belongs to the category model */