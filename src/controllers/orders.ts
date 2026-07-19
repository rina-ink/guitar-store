import type { RequestHandler } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.ts";
import Product from "../models/Product.ts";
import type { OrderInput } from "../schemas/orderSchemas.ts";

export const createOrder: RequestHandler = async (
    req,
    res,
    next
) => {
    const session = await mongoose.startSession();   // session allows MongoDB operations to belong to the same transaction

    try {
        const { customer, items } = req.body as OrderInput;

        let createdOrder: Awaited<ReturnType<typeof Order.create>>[number] | undefined;

        await session.withTransaction(async () => {
            /*
            combine duplicate product entries.

            for example:
            [
                { product: "abc", quantity: 2 },
                { product: "abc", quantity: 3 }
            ]

            becomes:
            product "abc" → quantity 5
            */
            const requestedQuantities = new Map<string, number>();   // the map stores: product ID -> total requested quantity

            for (const item of items) {
                const currentQuantity =
                    requestedQuantities.get(item.product) ?? 0;   // Map.get() returns the current stored value
                    // 0 + incoming quantity
                requestedQuantities.set(
                    item.product,
                    currentQuantity + item.quantity
                );
            }

            const productIds = [...requestedQuantities.keys()];
            // gives an iterator containing all unique product IDs
            // the spread operator converts it into an array
            const products = await Product.find({   // fetching all products in one query
                _id: {
                    $in: productIds,   // find products whose _id is contained in this array
                },
            }).session(session);

            if (products.length !== productIds.length) {
                const foundProductIds = new Set(
                    products.map((product) =>
                        product._id.toString()
                    )
                );

                const missingProductId = productIds.find(
                    (productId) =>
                        !foundProductIds.has(productId)
                );

                const error = new Error(
                    `Product not found: ${missingProductId}`
                );

                Object.assign(error, {
                    statusCode: 404,
                });

                throw error;
            }

            const orderItems = [];

            for (const product of products) {   // iterate over the products returned from MongoDB, not the raw input items
                const productId = product._id.toString();
                // the map uses string keys, so the ObjectId must be converted to a string before looking up the requested quantity
                const quantity =
                    requestedQuantities.get(productId);
                // this retrieves the total requested quantity for this product. For duplicate input items, it returns the combined value.
                if (quantity === undefined) {
                    // continue;
                    throw new Error(
                        `Requested quantity missing for product: ${productId}`
                    );
                }

                if (product.stock < quantity) {
                    const error = new Error(
                        `Not enough stock for product: ${product.name}`
                    );

                    Object.assign(error, {
                        statusCode: 409,
                    });

                    throw error;
                }

                orderItems.push({
                    product: product._id,
                    quantity,
                    price: product.price,
                });

                product.stock -= quantity;   // reducing stock
                // e.g. stock before: 8
                //      quantity:     3
                //      stock after:  5
                await product.save({
                    session,
                });
            }

            const totalPrice = orderItems.reduce(
                (total, item) =>
                    total + item.price * item.quantity,
                0
            );

            const orders = await Order.create(
                [
                    {
                        customer,
                        items: orderItems,
                        totalPrice,
                    },
                ],
                {
                    session,
                }
            );

            createdOrder = orders[0];
        });

        if (!createdOrder) {
            throw new Error("Order could not be created");
        }

        await createdOrder.populate(
            "items.product",
            "name brand price stock imageUrl"
            // later omit stock
        );

        res.status(201).json(createdOrder);
    } catch (error) {
        next(error);
    } finally {
        await session.endSession();
    }
};


/* This order controller demonstrates batching, duplicate normalization, historical price snapshots,
inventory updates, transaction rollback, population, and centralized error handling.


.


Transaction
await session.withTransaction(async () => {
    // product updates
    // order creation
});

inside this function:
- check products
- check stock
- reduce stock
- create order

If one step fails, MongoDB rolls back the changes.

for example:
- product 1 stock reduced successfully
- product 2 has insufficient stock

The stock reduction for product 1 is undone. 


.


It handles duplicate items, updates stock, and protects the complete operation with a MongoDB transaction.


.


Either the order and every stock update succeed together, or none of them are saved.


.


const session = await mongoose.startSession();
A Mongoose session is used to group related database operations.


.


try {
    // transaction and response
} catch (error) {
    next(error);
} finally {
    await session.endSession();
}

The roles are:
- try: attempts the complete operation
- catch: forwards errors
- finally: closes the session whether the operation succeeded or failed

The finally block is important because database sessions should not remain unnecessarily open.


.


await session.withTransaction(async () => {
Everything inside this callback belongs to one transaction, provided each database operation uses the same session.

If an error is thrown inside the callback:
throw error;
MongoDB aborts the transaction.

That means these stock changes:

product.stock -= quantity;
await product.save({ session });

will be rolled back if the order later fails to save.
*/