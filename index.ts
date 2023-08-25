import * as bodyParser from "body-parser";
import * as express from "express";
import * as multer from "multer";
import pushWebsite from "./src/handlers/v1/pushWebsite";

import verifyConnection from "./src/handlers/v1/verifyConnection";
import { verifyApiToken } from "./src/middlewares";

const app = express();
app.set("timeout", 0);

// db

// Parse JSON request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(verifyApiToken);
app.use(bodyParser.json());

const siteRouter = express.Router();

// add/edit connection infos
siteRouter.post("/verifyConnection", verifyConnection);

// add or update a site
siteRouter.post(
  "/sites",
  multer({ dest: "uploads/" }).single("file"),
  pushWebsite
);

app.use(siteRouter);

app.listen(8081, () => {
  console.log("API listening on port 8081");
});
