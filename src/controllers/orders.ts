import type { Request, Response } from "express";
import Order from "../models/Order.ts";
import Product from "../models/Product.ts";
import type { OrderInput } from "../schemas/orderSchemas.ts";

export const createOrder = async (
    req: Request,
    res: Response
) => {
    try {
        const { customer, items } = req.body as OrderInput;

        const orderItems = [];

        for (const item of items) {   // loops through every product requested by the customer
            const product = await Product.findById(item.product);   // uses the product ID from the request to find the real product document in MongoDB

            if (!product) {
                return res.status(404).json({
                    message: `Product not found: ${item.product}`,   // the return stops the entire order creation
                });
            }

            if (product.stock < item.quantity) {
                return res.status(409).json({
                    message: `Not enough stock for product: ${product.name}`,
                });
            }

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price,   // price does not come from the customer. It comes from the Product document
            });
        }

        const totalPrice = orderItems.reduce(   // reduce() combines all order items into one total number
            (total, item) =>
                total + item.price * item.quantity,
            0   // the 0 here is the starting value of total
        );

        const order = await Order.create({   // creates and saves the order in MongoDB
            customer,
            items: orderItems,
            totalPrice,
        });

        await order.populate(
            "items.product",
            "name brand price imageUrl"
        );

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json(error);
    }
};


/* the populated product’s price represents its current catalogue price.
The separate order-item price remains the historical purchase price. 


.


This controller creates a new order while making sure that:
- every requested product exists
- enough stock is available
- the current product price is copied into the order
- the total price is calculated by the server
- product details are populated before the response is sent


.


(item.product)
Mongoose converts it to an ObjectId for the query. */