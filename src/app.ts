import express from "express";
import cors from "cors";
import connectDb from "./db/index.ts";

const app = express();

const PORT = process.env.PORT || 8080;

connectDb();

// middleware
app.use(express.json());  
app.use(cors());   // allows other websites to make requests to the API

// routes
app.get("/", (req, res) => {
    res.send("Guitar Store API");
});

app.listen(PORT, () => {
    console.log(`Guitar Store API listening at http://localhost:${PORT}`);
});


/* cors
think of it like a bouncer
Imagine the API is a club

without cors: frontend -> API -> You're not on the guest list
with cors: frontend -> API -> Come in

.

each middleware gets a chance to inspect or modify the request/response before it reaches your controller */