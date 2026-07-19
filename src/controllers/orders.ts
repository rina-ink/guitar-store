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

    const session = await mongoose.startSession();
    /* the session allows MongoDB operations
    to belong to the same transaction */
    try {
        const { customer, items } = req.body as OrderInput;

        const createdOrder = await session.withTransaction(
            async () => {
                /*
                Combine duplicate product entries.

                For example:
                [
                    { product: "abc", quantity: 2 },
                    { product: "abc", quantity: 3 }
                ]

                becomes:
                product "abc" → quantity 5
                */
                const requestedQuantities =
                    new Map<string, number>();   // the map stores: product ID -> total requested quantity

                for (const item of items) {
                    const currentQuantity =
                        requestedQuantities.get(   // Map.get() returns the current stored value
                            item.product
                        ) ?? 0;   // 0 + incoming quantity

                    requestedQuantities.set(
                        item.product,
                        currentQuantity + item.quantity
                    );
                }

                const productIds = [
                    ...requestedQuantities.keys(),
                    // gives an iterator containing all unique product IDs
                    // the spread operator converts it into an array
                ];

                const products = await Product.find({   // fetch all products in one query
                    _id: {
                        $in: productIds,   // find products whose _id is contained in this array
                    },
                }).session(session);

                if (
                    products.length !== productIds.length
                ) {
                    const foundProductIds = new Set(
                        products.map((product) =>
                            product._id.toString()
                        )
                    );

                    const missingProductId =
                        productIds.find(
                            (productId) =>
                                !foundProductIds.has(
                                    productId
                                )
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
                    const productId =
                        product._id.toString();
                        // the map uses string keys, so the ObjectId must be converted to a string
                    const quantity =
                        requestedQuantities.get(
                            productId
                            // this retrieves the total requested quantity for this product. For duplicate input items, it returns the combined value
                        );

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
                        total +
                        item.price * item.quantity,
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

                return orders[0];
            }
        );

        if (!createdOrder) {
            throw new Error(
                "Order could not be created"
            );
        }

        await createdOrder.populate(
            "items.product",
            // "name brand price stock imageUrl"
            "name brand price imageUrl"
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


Transaction:

await session.withTransaction(async () => {
    // product updates
    // order creation
});

inside this function, the controller:

- checks that all products exist
- checks that enough stock is available
- reduces product stock
- creates the order

if one step fails, MongoDB rolls back all changes.

for example:

- product 1 stock is reduced successfully.
- product 2 has insufficient stock.

The stock reduction for product 1 is undone,
and the order is not created.


.


It handles duplicate items, updates stock, and protects the complete operation with a MongoDB transaction.
Either the order and every stock update succeed together, or none of them are saved.


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
Everything inside this callback belongs to one transaction, 
provided each database operation uses the same session.

if an error is thrown inside the callback:
throw error;
MongoDB aborts the transaction.

that means these stock changes:

product.stock -= quantity;
await product.save({ session });

will be rolled back if the order later fails to save. 


.


) ?? 0; use zero if this product has not been added to the map yet
*/