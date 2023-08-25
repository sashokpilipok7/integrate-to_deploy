import { Request, Response } from "express";
import * as fs from "fs";

import { CreateBucketCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@aws-sdk/client-s3";

import * as AwsService from "../../clouds/amazon";
import { AzureService } from "../../clouds/azure";
import { BunnyNetService } from "../../clouds/bunny.net";
import { SiteService } from "./siteService";

import { SERVICE } from "../../constants";
import { Site } from "../../db";
import { readDirectory, unzipFile } from "../../unzipper";
import { getMimeType } from "../../utils";

import { AwsParams } from "../../types";
import { IAzureRequestProps } from "../../clouds/azure/types";
import { IBunnyRequestProps } from "../../clouds/bunny.net/types";
import { IDigitalOceanRequestProps } from "../../clouds/digitalOcean/types";
import { StatusService } from "./statusService";
import { SiteSchemeProps } from "./types";
import { DigitalOceanService } from "../../clouds/digitalOcean";

export default async (req: Request, res: Response) => {
  req.setTimeout(0);
  res.setTimeout(0);

  switch (req.body.service) {
    case SERVICE.AWS:
      const awsParams: AwsParams = {
        // awsBucket: req.body.awsBucket,
        awsKey: req.body.connection_key,
        awsSecret: req.body.connection_secret_key,
        awsZone: req.body.connection_region || "eu-west-1",
      };

      // check if a website already exists
      // FIXME: this is duplicated code. Use a function isWebsiteAlreadyExist
      const site = await Site.findOne({ siteId: Number(req.body.site_id) });

      console.log(`Site trovato ${site}`);
      console.log(`Site trovato req.body.site_id ${req.body.site_id}`);

      // get the file zip from the request
      const file = await req.file;
      const name = file.path.split("/").pop();
      const dest = `./unzip/${name}`;

      console.log(`Arrivato il file ${file.path}`);

      try {
        await unzipFile(file.path, dest);
      } catch (error) {
        return res.status(500).send({ error: error.message });
      }

      console.log(`File Scompattato ${dest}`);

      const filesToUpload = readDirectory({ path: dest });
      const s3 = AwsService.getS3Instance(awsParams);

      // this is a new file
      if (!site) {
        // create the bucket with the site id
        const site = await Site.create({
          siteId: Number(req.body.site_id),
          connectionUniqId: req.body.connection_uniq_id,
          connectionInfo: {
            type: req.body.connection_type,
            key: req.body.connection_key,
            secretKey: req.body.connection_secret_key,
            region: req.body.connection_region,
          },
        });
        // cerate the bucket
        const bucketName = `sc-${site._id.toString()}`;
        // push the zip file to the bucket
        let bucket;
        let appError;

        try {
          bucket = await AwsService.createBucket(s3, bucketName);
          console.log("success creating bucket:", bucket);

          await AwsService.updatePublicAccessBlock(s3, bucketName);
          await AwsService.updatePublicAccessPolicy(s3, bucketName);
        } catch (error) {
          console.error(error);
          appError = error;
          return res.status(500).send({ error: error.message, code: "00167" });
        }

        console.log("creato nuovo bucket");
        let success;

        try {
          // configura il bucket come sito web
          // dando la homepagina e la pagina di errore
          const params = {
            Bucket: bucketName,
            WebsiteConfiguration: {
              IndexDocument: {
                Suffix: "index.html",
              },
              ErrorDocument: {
                Key: "error.html",
              },
            },
          };
          await AwsService.putBucketWebsite(s3, params);

          console.log("configurato come sito web:");
          console.log(success);
        } catch (error) {
          appError = error;
          success = false;
          return res.status(500).send({ error: error.message, code: "00168" });
        }

        console.log("comincio il ciclo di upload");
        for await (const file of filesToUpload) {
          try {
            const s3FileName = file.replace(dest + "/", "");
            const s3FileContent = fs.readFileSync(file);
            let mimeType = await getMimeType(s3FileName);
            console.log("mimeType", mimeType);

            const s3UploadFile = {
              Bucket: bucketName,
              Key: s3FileName,
              Body: s3FileContent,
              ContentType: mimeType,
            };

            await AwsService.uploadFile(s3, s3UploadFile);

            console.log("success upload file:", s3FileName);
            success = true;
          } catch (error) {
            appError = error;
            success = false;
            console.log("error upload file:" + file);
            console.log(error);
            return res.status(500).send(appError);
          }
        }

        let cfDomain;
        const { awsKey, awsSecret, awsZone } = awsParams;

        try {
          const distribution = await AwsService.createDistribution(
            awsKey,
            awsSecret,
            awsZone,
            bucketName
          );
          cfDomain = distribution.Distribution.DomainName;
        } catch (error) {
          appError = error;
          success = false;
          console.log("error upload file: 2");
          console.log(error);
          return res.status(500).send(appError);
        }

        try {
          site.status = "deployed";

          console.log("cfDomain", cfDomain);
          console.log(
            "bucketName",
            `http://${bucketName}.s3-website.${awsZone}.amazonaws.com/`
          );

          site.url = [
            `http://${bucketName}.s3-website.${awsZone}.amazonaws.com/`,
            `https://${cfDomain}`,
          ];
          await site.save();
        } catch (error) {
          appError = error;
          success = false;
          console.log("error upload file: 3");
          console.log(error);
          console.log(appError);
          return res.status(500).send(appError);
        }

        return res.send({ urls: site.url });
      } else {
        //site exists
        console.log("comincio il ciclo di upload");
        const bucketName = `sc-${site._id.toString()}`;
        let success;
        let appError;

        for await (const file of filesToUpload) {
          try {
            const s3FileName = file.replace(dest + "/", "");
            const s3FileContent = fs.readFileSync(file);
            let mimeType = await getMimeType(s3FileName);
            console.log("mimeType", mimeType);

            const s3UploadFile = {
              Bucket: bucketName,
              Key: s3FileName,
              Body: s3FileContent,
              ContentType: mimeType,
            };

            await AwsService.updatePublicAccessBlock(s3, bucketName);
            await AwsService.updatePublicAccessPolicy(s3, bucketName);
            await AwsService.uploadFile(s3, s3UploadFile);

            console.log("success upload file:", s3FileName);

            success = true;
          } catch (error) {
            appError = error;
            success = false;
            console.error(`error upload file: ${file}`);
            console.error(error);
            return res.status(500).send(appError);
          }

          return res.send({ urls: site.url });
        }
      }
      break;

    case SERVICE.BUNNY_NET:
      // Set params from request to service
      BunnyNetService.requestParams = {
        AccessKey: req.body.connection_key,
        Region: req.body.connection_region ?? "de",
        ZoneTier: req.body.zoneTier ?? 1,
        Type: req.body.connection_type ?? 1,
      } as IBunnyRequestProps;

      // Check if a website already exists
      const siteData: SiteSchemeProps = await SiteService.isWebsiteAlreadyExist(
        req.body.site_id
      );

      // Get file from request
      const fileData = (await SiteService.getFileFromRequest(
        req,
        res
      )) as string;

      // Get all files from directory
      const fileToUpload: string[] = readDirectory({ path: fileData });

      // Function to upload files
      const uploadFiles = async (files: string[], isUpdating = false) => {
        for await (const file of files) {
          // FIXME: add new method SiteService.getFileNameAndPath
          const fileName = file.split("/").at(-1);
          const path = file
            .replace(fileData + "/", "")
            .split("/")
            .slice(0, -1)
            .join("/");
          const fileContent = fs.readFileSync(file);

          // Upload file to storage zone
          if (!isUpdating) {
            await BunnyNetService.uploadFile({
              path,
              fileName,
              fileContent,
            });
          } else {
            const storageZoneName = BunnyNetService.createStorageZoneName(
              siteData._id.toString()
            );
            const { StorageZoneId } =
              await BunnyNetService.getStorageZoneDetails(storageZoneName);

            await BunnyNetService.uploadFile({
              path,
              fileName,
              fileContent,
              StorageZoneId,
            });
          }
        }
      };

      // This is a new website
      if (!siteData) {
        try {
          // Create new site
          const newSite: SiteSchemeProps = await SiteService.createSite(req);

          // Add Storage Zone
          const storageZoneName = BunnyNetService.createStorageZoneName(
            newSite._id.toString()
          );
          const storageZone = await BunnyNetService.addStorageZone(
            storageZoneName
          );
          console.log("storageZone", storageZone);

          // Add Pull Zone
          const pullZoneName = BunnyNetService.createPullZoneName(
            newSite._id.toString()
          );
          const pullZone = await BunnyNetService.addPullZone(pullZoneName);
          console.log("pullZone", pullZone);

          // Get file from request and upload it
          await uploadFiles(fileToUpload);

          // Add deployment status to site
          await SiteService.addDeploymentStatus(newSite, "deployed");

          // Add url to site
          const urls = [`https://${pullZoneName}.b-cdn.net`];
          await SiteService.addUrlToSite(newSite, urls);

          console.log("urls", urls);

          // Save site
          await SiteService.saveSite(newSite);

          return res.status(200).send({
            message: "File deployed successfully",
            urls,
          });
        } catch (error) {
          console.log(error);
          return res.status(500).send({ error: error.message, code: "00168" });
        }
      }

      // This is an existing website
      if (siteData) {
        try {
          // Get file from request and upload it
          await uploadFiles(fileToUpload, true);

          // Add url to site
          siteData.url = await BunnyNetService.getUrls();

          return res.status(200).send({
            message: "File updated successfully",
            urls: siteData.url,
          });
        } catch (error) {
          console.log(error);
          return res.status(500).send({ error: error.message, code: "00168" });
        }
      }

      break;

    case SERVICE.AZURE:
      // Set params from request to service
      AzureService.requestParams = {
        accountKey: req.body.connection_key,
        accountName: req.body.account_name,
      } as IAzureRequestProps;

      // Check if a website already exists
      const siteFromAzureHost: SiteSchemeProps =
        await SiteService.isWebsiteAlreadyExist(req.body.site_id);

      // Get file from request
      const fileForStaticWebsite = (await SiteService.getFileFromRequest(
        req,
        res
      )) as string;

      // Get all files from directory
      const fileToStaticWebsite: string[] = readDirectory({
        path: fileForStaticWebsite,
      });
      const blobServiceClient = await AzureService.createBlobServiceClient();
      const containerClient = await blobServiceClient.getContainerClient(
        AzureService.containerDefaultName
      );

      // Function to upload files
      const uploadFileToBlob = async ({
        filePath,
        fileData,
        folderName,
      }: {
        filePath: string;
        fileData: string;
        folderName: string;
      }): Promise<void> => {
        const { fileName, path } = SiteService.getFileNameAndPath(
          filePath,
          fileData
        );

        const blobClient = containerClient.getBlockBlobClient(
          path
            ? `${folderName}/${path}/${fileName}`
            : `${folderName}/${fileName}`
        );

        const fileContent = fs.readFileSync(filePath);
        const blobContentType = await getMimeType(fileName);

        // FIXME: This is this is a local check, these files are created on Mac, this cannot be in production
        if (fileName.startsWith("._") || fileName.startsWith(".DS_Store"))
          return;

        await blobClient.upload(fileContent, fileContent.length, {
          blobHTTPHeaders: {
            blobContentType,
          },
        });
      };

      // This is a new website
      if (!siteFromAzureHost) {
        try {
          // Create new site
          const newSite: SiteSchemeProps = await SiteService.createSite(req);
          const folderName = `${newSite._id.toString()}`;

          // Upload files to blob
          for await (const file of fileToStaticWebsite) {
            await uploadFileToBlob({
              filePath: file,
              fileData: fileForStaticWebsite,
              folderName,
            });
          }

          // Add deployment status to site
          await SiteService.addDeploymentStatus(newSite, "deployed");

          // Add url to site
          const urls = AzureService.getUrls(folderName);
          await SiteService.addUrlToSite(newSite, urls);

          // Save site
          await SiteService.saveSite(newSite);

          return StatusService.OK(res, {
            message: "File deployed successfully",
            urls,
          });
        } catch (error) {
          return StatusService.InternalServerError(res, error);
        }
      }

      // This is an existing website
      if (siteFromAzureHost) {
        try {
          // Upload files to blob
          for await (const file of fileToStaticWebsite) {
            await uploadFileToBlob({
              filePath: file,
              fileData: fileForStaticWebsite,
              folderName: siteFromAzureHost._id.toString(),
            });
          }

          // Add url to site
          siteFromAzureHost.url = AzureService.getUrls(
            siteFromAzureHost._id.toString()
          );

          return StatusService.OK(res, {
            message: "File updated successfully",
            urls: siteFromAzureHost.url,
          });
        } catch (error) {
          return StatusService.InternalServerError(res, error);
        }
      }

      break;

    case SERVICE.DIGITAL_OCEAN:
      // Set params from request to service
      DigitalOceanService.requestParams = {
        accessKey: req.body.connection_key,
        region: req.body.connection_region ?? "nyc3",
      } as IDigitalOceanRequestProps;

      const key = req.body.connection_key;
      const secretKey = req.body.connection_secret_key;
      const region = req.body.connection_region ?? "nyc3";

      const s3Client = new S3({
        forcePathStyle: false, // Configures to use subdomain/virtual calling format.
        endpoint: `https://${region}.digitaloceanspaces.com`,
        region: "us-east-1",
        credentials: {
          accessKeyId: key,
          secretAccessKey: secretKey,
        },
      });

      const siteFromDOHost: SiteSchemeProps =
        await SiteService.isWebsiteAlreadyExist(req.body.site_id);
      console.log(siteFromDOHost, "siteFromDOHost");
      // Get file from request
      const fileForStaticDOWebsite = (await SiteService.getFileFromRequest(
        req,
        res
      )) as string;

      // Get all files from directory
      const fileToStaticDOWebsite: string[] = readDirectory({
        path: fileForStaticDOWebsite,
      });

      console.log(fileForStaticDOWebsite, "fileForStaticDOWebsite");
      console.log(fileToStaticDOWebsite, "fileToStaticDOWebsite");

      //name of backet or space and url
      const bucketNameDO = `sc-${req.body.site_id}`;
      const urlsDo = [
        `https://${bucketNameDO}.${region}.digitaloceanspaces.com/index.html`,
      ];

      // function for uploading files
      async function uploadFileDO(params: any) {
        try {
          const data = await s3Client.send(new PutObjectCommand(params));
          console.log(
            "Successfully uploaded object: DO" +
              params.Bucket +
              "/" +
              params.Key
          );
          return data;
        } catch (err) {
          console.log("Error UPLOAD DO", err);
        }
      }

      if (!siteFromDOHost) {
        try {
          // Create new site
          const newSite: SiteSchemeProps = await SiteService.createSite(req);
          const folderName = `${newSite._id.toString()}`;

          const bucketParams = { Bucket: bucketNameDO };

          async function createBucketDO() {
            try {
              const data = await s3Client.send(
                new CreateBucketCommand(bucketParams)
              );
              console.log("Success DO", data.Location);
              return data;
            } catch (err) {
              console.log("Error DO", err);
            }
          }

          await createBucketDO();
          // Upload files to blob
          console.log("FILE UPLOADING PROCCESS");

          for await (const file of fileToStaticDOWebsite) {
            const { fileName, path, cleanedPathWithName } =
              SiteService.getFileNameAndPath(file, fileToStaticDOWebsite);

            console.log(path, "path -------------");
            console.log(cleanedPathWithName, "-------cleanedPath-----");
            const fileContent = fs.readFileSync(file);
            const blobContentType = await getMimeType(fileName);

            const bucketParamsUpload = {
              Bucket: bucketNameDO,
              Key: cleanedPathWithName,
              Body: fileContent, // Use the file content from req.params
              ACL: "public-read",
              ContentType: blobContentType,
            };

            await uploadFileDO(bucketParamsUpload);
          }

          // Add deployment status to site
          await SiteService.addDeploymentStatus(newSite, "deployed");

          // Add url to site
          await SiteService.addUrlToSite(newSite, urlsDo);

          // Save site
          await SiteService.saveSite(newSite);

          return StatusService.OK(res, {
            message: "File deployed successfully",
            urlsDo,
          });
        } catch (error) {
          return StatusService.InternalServerError(res, error);
        }
      } else if (siteFromDOHost) {
        try {
          // Add url to site
          // siteFromAzureHost.url = AzureService.getUrls(
          //   siteFromAzureHost._id.toString()
          // );

          for await (const file of fileToStaticDOWebsite) {
            const { fileName, path } = SiteService.getFileNameAndPath(
              file,
              fileToStaticDOWebsite
            );

            const fileContent = fs.readFileSync(file);
            const blobContentType = await getMimeType(fileName);

            const bucketParamsUpload = {
              Bucket: bucketNameDO,
              Key: `solid/${fileName}`,
              Body: fileContent, // Use the file content from req.params
              ACL: "public-read",
              ContentType: blobContentType,
            };

            await uploadFileDO(bucketParamsUpload);
          }

          return StatusService.OK(res, {
            message: "File updated successfully",
            urls: urlsDo,
          });
        } catch (error) {
          return StatusService.InternalServerError(res, error);
        }
      }

      const myFile = await req.file;
      console.log("myFile", "myFile");

      break;

    default:
      return StatusService.UnprocessableEntity(res, {
        error: "No service provided",
      });
  }

  return StatusService.OK(res, { message: "File deployed successfully" });
};
