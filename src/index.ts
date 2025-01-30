import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();

const server = createServer(app);

const _dirname = dirname(fileURLToPath(import.meta.url))
app.get("/", (req, res) => {
    res.sendFile(join(_dirname, '../src/index.html'))

});

app.listen(3000, () => {
    console.log("server running at http://localhost:3000")
})