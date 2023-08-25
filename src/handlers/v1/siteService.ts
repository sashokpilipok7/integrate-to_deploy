import { Request, Response } from "express";
import { Site } from "../../db";
import { unzipFile } from "../../unzipper";

import { deployStatus, SiteSchemeProps } from "./types";

export const SiteService = {
  async isWebsiteAlreadyExist(siteId: number): Promise<SiteSchemeProps> {
    const site: SiteSchemeProps = await Site.findOne({
      siteId: Number(siteId),
    });

    console.log(`Site trovato ${site}`);
    console.log(`Site trovato req.body.site_id ${siteId}`);

    return site;
  },

  async getFileFromRequest(
    req: Request,
    res: Response
  ): Promise<string | Response> {
    const file = await req.file;
    const name = file.path.split("/").pop();
    const dest = `./unzip/${name}`;

    try {
      await unzipFile(file.path, dest);

      return dest;
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  async createSite(req: Request): Promise<SiteSchemeProps> {
    const site = (await Site.create({
      siteId: Number(req.body.site_id),
      connectionUniqId: req.body.connection_uniq_id,
      connectionInfo: {
        type: req.body.connection_type ?? null,
        key: req.body.connection_key,
        secretKey: req.body.connection_secret_key ?? null,
        region: req.body.connection_region,
      },
    })) as SiteSchemeProps;

    return site;
  },

  async saveSite(site: SiteSchemeProps): Promise<void> {
    await site.save();
  },

  async addDeploymentStatus(
    site: SiteSchemeProps,
    deploymentStatus: keyof typeof deployStatus
  ): Promise<void> {
    site.status = deploymentStatus;
  },

  async addUrlToSite(site: SiteSchemeProps, urls: string[]): Promise<void> {
    site.url = urls;
  },

  getFileNameAndPath(filePath: string, fileData: any): any {
    const fileName = filePath.split("/").at(-1);
    const path = filePath
      .replace(fileData + "/", "")
      .split("/")
      .slice(0, -1)
      .join("/");

    const regexToRemove = /\/unzip\/uploads\\[^/]*\//;
    let cleanedPathWithName = filePath.replace(regexToRemove, "");
    cleanedPathWithName = cleanedPathWithName.split("/").slice(1).join("/");

    return { fileName, path, cleanedPathWithName };
  },
};
