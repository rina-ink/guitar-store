import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters long"],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Email is not valid"],   // regex
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            select: false,   // tells Mongoose not to include the password in query results by default
            minlength: [8, "Password must be at least 8 characters long"],
        },
    },
    {
        timestamps: true,   // adds fields createdAt and updatedAt
        toJSON: {   // configures how a Mongoose document is converted into JSON
            virtuals: true,   // virtual is a property that behaves like a field but is not stored in MongoDB
        },
    }
);

export default model("User", userSchema);


/* Schema is used to describe the structure and rules of a MongoDB document.
Model turns that schema into a model you can use to query and modify the database. 

unique: true, tells Mongoose to create a unique MongoDB index for the email field
trim: true, removes whitespace from the beginning and end of the string 

model("User", userSchema) this tells Mongoose: create a model called User using userSchema 

userSchema - this is the blueprint the model must follow. 
Every document created through this model is checked against these rules */