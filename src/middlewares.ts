import { Request, Response } from "express";

export function verifyApiToken(req: Request, res: Response, next: any) {
  // in case the API_SERVER_AUTH is not set or set to false
  // or if the API_TOKEN is not set, skip the token verification
  if (!process.env.API_SERVER_AUTH || !process.env.API_TOKEN) {
    return next();
  }

  const apiToken = req.headers["x-api-token"];
  if (!apiToken) {
    return res.status(401).send({ error: "Missing X-API-TOKEN header" });
  }
  // check if the token is valid
  if (apiToken !== process.env.API_TOKEN) {
    return res.status(401).send({ error: "Invalid X-API-TOKEN" });
  }
  next();
}
