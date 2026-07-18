import { Schema, model } from "mongoose";

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            lowercase: true,
            unique: true,   // creates a MongoDB unique index, category names should normally not repeat
            minlength: [2, "Category name must be at least 2 characters long"],
        },

        description: {
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

export default model("Category", categorySchema);