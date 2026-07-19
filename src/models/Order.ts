import { Schema, model } from "mongoose";

const orderItemSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product is required"],
        },

        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"],
        },

        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
            // stores the product price at the time of purchase
        },
    },
    {
        _id: false,
    }
);

const orderSchema = new Schema(
    {
        customer: {   // enables guest checkout
            name: {
                type: String,
                required: [true, "Customer name is required"],
                trim: true,
            },

            email: {
                type: String,
                required: [true, "Customer email is required"],
                trim: true,
                lowercase: true,
            },

            shippingAddress: {  // future protected admin/customer routes
                street: {
                    type: String,
                    required: [true, "Street is required"],
                    trim: true,
                },

                city: {
                    type: String,
                    required: [true, "City is required"],
                    trim: true,
                },

                postalCode: {
                    type: String,
                    required: [true, "Postal code is required"],
                    trim: true,
                },

                country: {
                    type: String,
                    required: [true, "Country is required"],
                    trim: true,
                },
            },
        },

        items: {
            type: [orderItemSchema],
            required: [true, "Order items are required"],
            validate: {
                validator: (items: unknown[]) => items.length > 0,
                message: "An order must contain at least one item",
            },
        },

        totalPrice: {
            type: Number,
            required: [true, "Total price is required"],
            min: [0, "Total price cannot be negative"],
        },

        status: {
            type: String,
            enum: [
                "pending",
                "paid",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

export default model("Order", orderSchema);


/* customer instead of userId
means customers don't have to register 

design decision:
The order stores customer information instead of a userId.
This enables guest checkout, so customers can place an order without creating an account. 


.


- enabling both:
after adding authentication

customer - required (guest checkout)
user - optional (registration) 

userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
*/