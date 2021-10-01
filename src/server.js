import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./configs/viewEngine";
import webRoutes from "./routes/web";

// Use dotenv to read .env vars into Node
require("dotenv").config();

const port = process.env.PORT || 3000;

// Imports dependencies and set up http server
// import { urlencoded, json } from "body-parser";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Config view engine
viewEngine(app);

// Init web route
webRoutes(app);

// Parse application/x-www-form-urlencoded
// app.use(urlencoded({ extended: true }));

// // Parse application/json
// app.use(json());

// listen for requests :)
app.listen(port, () =>
    console.log(`Your app is listening on http://localhost:${port}`)
);
