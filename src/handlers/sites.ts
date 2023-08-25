import { Request, Response } from "express";
import * as fs from "fs";
import {
  createBucket,
  createCertificate,
  createDistribution,
  deleteBucket,
  getS3Instance,
  icreateCertificateParams,
  putBucketWebsite,
  uploadFile,
} from "../clouds/amazon";
import { Site } from "../db";
import { readDirectory, unzipFile } from "../unzipper";
import { decryptString, encryptString, getMimeType } from "../utils";

import { AwsParams, ConnectionInfo } from "../types";

export const createSite = async (req: Request, res: Response) => {
  const site = {
    name: req.body.name,
    userId: req.body.userId,
    username: req.body.username,
    siteId: req.body.siteId,
  };

  const newSite = new Site(site);
  newSite.status = "created";
  newSite.createdAt = new Date();
  newSite.updatedAt = new Date();
  // crea il sito
  try {
    newSite.save();
    res.status(201).send(newSite);
  } catch (error) {
    res.status(422).send({ error: error.message });
  }
};

export const addConnectionInfo = async (req: Request, res: Response) => {
  // find site by siteID
  let site;

  try {
    site = await Site.findById(req.params.id);
  } catch (error) {
    return res.status(404).send({ error: "Site not found" });
  }
  console.log("site", site._id);

  if (!site) {
    return res.status(404).send({ error: "Site not found" });
  }

  // update connection info
  const connection: ConnectionInfo = {
    service: req.body.service,
    params: {},
  };

  switch (req.body.service) {
    case "aws":
      const awsParams: AwsParams = {
        awsBucket: req.body.awsBucket,
        awsKey: req.body.awsKey,
        awsSecret: req.body.awsSecret,
        awsZone: req.body.awsZone,
      };

      let data: any = {};

      // test the connection
      try {
        const s3 = getS3Instance(awsParams);
        data = await s3.listBuckets().promise();
      } catch (error) {
        return res.status(422).send({ verified: false, error: error.message });
      }

      // check if data has any Buckets in it
      if (data.Bucket) {
        return res
          .status(422)
          .send({ verified: false, error: "No buckets found" });
      }

      // encrypt the aws secret
      const result = encryptString(awsParams.awsSecret);
      awsParams.awsSecret = "";
      awsParams.awsSecretCrypted = result.encrypted;
      awsParams.ivHex = result.ivHex;
      connection.params = awsParams;
      // update site info
      site.connectionInfo = connection;
      site.connectionVerified = true;
      site.status = "ready";
      break;
    case "azure":
      break;
    case "stacking.cloud":
      break;
    default:
      break;
  }

  try {
    await site.save();
    return res.status(200).send({ verified: true, site });
  } catch (error) {
    return res.status(422).send({ verified: false, error: error.message });
  }
};

export const deleteBucketHandler = async (req: Request, res: Response) => {
  const s3 = getS3Instance({
    aws_key: "AKIARMJYYS52LDSWH25P",
    aws_secret: "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",
    aws_zone: "eu-west-1",
  });

  const bucketName = req.params.bucket;

  const deleted = await deleteBucket(s3, bucketName);

  if (deleted) {
    res.send("Bucket deleted");
  }
};

export const activateHttpsHandler = async (req: Request, res: Response) => {
  const cert = req.body.CertificateArn;

  console.log(cert);

  const AWS = require("aws-sdk");
  const cloudfront = new AWS.CloudFront({
    region: "eu-west-1",
    accessKeyId: "",
    secretAccessKey: "",
  });
  const url = req.body.url;

  // create access identity
  const paramsOAI = {
    CloudFrontOriginAccessIdentityConfig: {
      CallerReference: "dajndkajsndjandjnasjkndjkas",
      Comment: "string",
    },
  };

  let originResponse;
  try {
    originResponse = await cloudfront
      .createCloudFrontOriginAccessIdentity(paramsOAI)
      .promise();
    console.log("Ok creata");
    console.log(originResponse);
  } catch (err) {
    console.log(err);
  }

  console.log();
  // https://github.com/aws/aws-sdk-js/issues/2368
  const params = {
    DistributionConfig: {
      CallerReference: "dajndkajsndjandjnasjkndjkasa",
      Origins: {
        Quantity: 1,
        Items: [
          {
            Id: "S3-Origin",
            DomainName: "prova-acm.s3-website-eu-west-1.amazonaws.com",
            S3OriginConfig: {
              OriginAccessIdentity:
                "origin-access-identity/cloudfront/" +
                originResponse.CloudFrontOriginAccessIdentity.Id,
            },
          },
        ],
      },
      DefaultCacheBehavior: {
        TargetOriginId: "S3-Origin",
        ViewerProtocolPolicy: "redirect-to-https",
        ForwardedValues: {
          QueryString: false,
          Cookies: {
            Forward: "none",
          },
        },
        TrustedSigners: {
          Enabled: false,
          Quantity: 0,
        },
        MinTTL: 86400,
      },
      CacheBehaviors: {
        Quantity: 0,
      },
      CustomErrorResponses: {
        Quantity: 0,
      },
      Comment: "",
      // Logging: {
      //   Enabled: false,
      //   IncludeCookies: false,
      //   Bucket: '',
      //   Prefix: ''
      // },
      PriceClass: "PriceClass_All",
      Enabled: true,
      ViewerCertificate: {
        ACMCertificateArn: cert,
        SSLSupportMethod: "sni-only",
        MinimumProtocolVersion: "TLSv1.1_2016",
      },
    },
  };

  console.log(params.DistributionConfig.Origins.Items[0].S3OriginConfig);
  const data = await cloudfront.createDistribution(params).promise();

  res.send(data);
};

export const requestCertificateHandler = async (
  req: Request,
  res: Response
) => {
  console.log("requestCertificateHandler");
  const url = req.body.url;
  // create icreateCertificateParams instance
  const params: icreateCertificateParams = {
    region: "eu-west-1",
    domain: url,
  };

  // validate url with regexp
  if (
    url.match(
      /^(\*\.)?(((?!-)[A-Za-z0-9-]{0,62}[A-Za-z0-9])\.)+((?!-)[A-Za-z0-9-]{1,62}[A-Za-z0-9])$/
    )
  ) {
    console.log("Valid domain name!");
  } else {
    return res.status(500).send({ error: "Invalid domain name!" });
  }
  // arn:aws:acm:eu-west-1:095145203572:certificate/362c5af1-aebc-4d5f-b0a9-05023345a4df
  const certData = await createCertificate(params);
  res.send(certData);
};

export const createBucketHandler = async (req: Request, res: Response) => {
  let site;

  try {
    site = await Site.findById(req.params.id);
  } catch (error) {
    return res.status(404).send({ error: "Site not found" });
  }
  console.log("site", site._id);

  if (!site) {
    return res.status(404).send({ error: "Site not found" });
  }

  const file = req.file;
  const name = file.path.split("/").pop();
  const dest = "./unzip/" + name;

  console.log("Arriva il file");
  try {
    await unzipFile(file.path, dest);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }

  console.log("File Scompattato");

  const filesToUpload = readDirectory({ path: dest });

  console.log("Files letti");

  switch (site.connectionInfo.service) {
    case "aws":
      console.log("AWS");
      console.log(site.connectionInfo);
      const awsKey = site.connectionInfo.params.awsKey;
      const str = site.connectionInfo.params.awsSecretCrypted;
      const iv = site.connectionInfo.params.ivHex;
      const awsZone = site.connectionInfo.params.awsZone;
      const awsSecret = decryptString(str, iv);
      const bucketName = site.connectionInfo.params.awsBucket;

      try {
        const s3 = getS3Instance({
          awsKey: awsKey,
          awsSecret: awsSecret,
          awsZone: awsZone,
        });

        // const bucketName = req.params.bucketName;

        // if (!bucketName) {
        //   return res.status(500).send({ error: 'Bucket name is required!' });
        // }

        let bucket;
        let appError;
        try {
          bucket = await createBucket(s3, bucketName);
          console.log("success create bucket:", bucket);
        } catch (error) {
          console.log(error);
          appError = error;
          return res.status(500).send({ error: error.message, code: "00167" });
        }

        console.log("creato nuovo bucket");

        // Nel caso il bucket esista già semplilcemente continua
        // sovrascrivendo tutto il contenuto
        // if (appError.code !== 'BucketAlreadyOwnedByYou') {
        //   return res.status(500).send(appError);
        // }

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
          await putBucketWebsite(s3, params);
          console.log("configurato come sito web:");
          console.log(success);
          success = true;
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
              ACL: "public-read",
            };
            await uploadFile(s3, s3UploadFile);
            console.log("success upload file:", s3FileName);
            success = true;
          } catch (error) {
            appError = error;
            success = false;
            console.log("error upload file: 3" + file);
            console.log(error);
            return res.status(500).send(appError);
          }
        }

        let cfDomain;
        try {
          const distribution = await createDistribution(
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
          site.url = [
            `http://${bucketName}.s3-website.${awsZone}.amazonaws.com/`,
            `https://${cfDomain}`,
          ];
          await site.save();
        } catch (error) {
          appError = error;
          success = false;
          console.log("error upload file: 1");
          console.log(error);
          return res.status(500).send(appError);
        }

        return res.send({ urls: site.url });
      } catch (error) {
        return res.status(500).send(error);
      }
      break;
    default:
      return res.status(500).send({ error: "Service not supported" });
  }
};

// questo e' buono e funziona 2023/02/05
export const createCloudfrontHandler = async (req: Request, res: Response) => {
  const result = ""; // await createDistribution()
  res.send(result);
};
