import express from "express";

const app = express();

const PORT = process.env.PORT || 8080;

// middleware
app.use(express.json());

// routes
app.get("/", (req, res) => {
    res.send("Guitar Store API");
});

app.listen(PORT, () => {
    console.log(`Guitar Store API listening at http://localhost:${PORT}`);
});