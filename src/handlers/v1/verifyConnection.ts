import { Request, Response } from "express";
import * as AwsService from "../../clouds/amazon";
import { AzureService } from "../../clouds/azure";
import { BunnyNetService } from "../../clouds/bunny.net";
import { DigitalOceanService } from "../../clouds/digitalOcean";
import { StatusService } from "./statusService";

import { SERVICE } from "../../constants";

import { IDigitalOceanRequestProps } from "../../clouds/digitalOcean/types";
import { IAzureRequestProps } from "../../clouds/azure/types";
import { IBunnyRequestProps } from "../../clouds/bunny.net/types";
import { AwsParams } from "../../types";

export default async (req: Request, res: Response) => {
  let connectionInfo = {
    verified: false,
  };

  switch (req.body.service) {
    case SERVICE.AWS:
      const awsParams: AwsParams = {
        awsBucket: req.body.awsBucket,
        awsKey: req.body.awsKey,
        awsSecret: req.body.awsSecret,
        awsZone: req.body.awsZone || "eu-west-1",
      };

      let data: any = {};

      // test the connection
      try {
        const s3 = AwsService.getS3Instance(awsParams);
        data = await s3.listBuckets().promise();
      } catch (error) {
        return StatusService.UnprocessableEntity(res, {
          verified: false,
          error: error.message,
        });
      }

      console.log("data", data);

      // check if data has any Buckets in it
      if (data.Bucket) {
        return StatusService.UnprocessableEntity(res, {
          verified: false,
          error: "No buckets found",
        });
      }

      // encrypt the aws secret
      // const result = encryptString(awsParams.awsSecret)
      // awsParams.awsSecret = ''
      // awsParams.awsSecretCrypted = result.encrypted
      // awsParams.ivHex = result.ivHex
      connectionInfo.verified = true;
      break;

    case SERVICE.BUNNY_NET:
      // get params from request
      BunnyNetService.requestParams = {
        AccessKey: req.body.accessKey,
      } as IBunnyRequestProps;

      // test the connection
      try {
        await BunnyNetService.getInstance();

        connectionInfo.verified = true;
      } catch (error) {
        return StatusService.UnprocessableEntity(res, {
          verified: false,
          error: error.message,
        });
      }

      break;

    case SERVICE.AZURE:
      // get params from request
      AzureService.requestParams = {
        accountKey: req.body.accessKey,
        accountName: req.body.accountName,
      } as IAzureRequestProps;

      // test the connection
      try {
        await AzureService.getInstance();

        connectionInfo.verified = true;
      } catch (error) {
        console.error(error);
        return StatusService.UnprocessableEntity(res, {
          verified: false,
          error: error.message,
        });
      }

      break;

    case SERVICE.DIGITAL_OCEAN:
      // get params from request

      DigitalOceanService.requestParams = {
        accessKey: req.body.accessKey,
        accountName: req.body.accountName,
      } as IDigitalOceanRequestProps;

      // test the connection
      try {
        await DigitalOceanService.getInstance();

        console.log("Digital Ocean connected");
        connectionInfo.verified = true;
      } catch (error) {
        console.error(error);
        return StatusService.UnprocessableEntity(res, {
          verified: false,
          error: error.message,
        });
      }

      break;

    default:
      return StatusService.UnprocessableEntity(res, {
        verified: false,
        error: "No service",
      });
  }

  return StatusService.OK(res, { connectionInfo, ...req.body });
};
