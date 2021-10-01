import express from "express";
import homeController from '../controllers/homeController';

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", homeController.getHomePage);
    router.get("/webhook", homeController.getWebhook);
    router.post("/webhook", homeController.postWebhook);
    // router.post("/setup-profile", homeController.setupProfile);
    router.post("/setup-persistent-menu", homeController.setupPersistentMenu);

    return app.use("/", router);
};

module.exports = initWebRoutes;