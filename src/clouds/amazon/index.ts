import * as AWS from "aws-sdk";

export const getS3Instance = (params: any) => {
  const AWS = require("aws-sdk");
  const credentials = new AWS.Credentials({
    accessKeyId: params.awsKey,
    secretAccessKey: params.awsSecret,
  });

  AWS.config.update({
    credentials,
    region: params.awsZone,
  });

  return new AWS.S3();
};

export const testAwsConnection = (s3: AWS.S3) => {
  return s3.listBuckets().promise();
};

export const getCloudfrontInstance = (params: any) => {
  const AWS = require("aws-sdk");
  AWS.config.update({
    accessKeyId: params.awsKey,
    secretAccessKey: params.awsSecret,
    region: params.awsZone,
  });
  return new AWS.CloudFront();
};

export const createBucket = (s3: AWS.S3, bucketName: string) => {
  return s3
    .createBucket({ Bucket: bucketName, ObjectOwnership: "ObjectWriter" })
    .promise();
};

export const putBucketWebsite = (s3: AWS.S3, params: any) => {
  return s3.putBucketWebsite(params).promise();
};

export const uploadFile = (
  s3: AWS.S3,
  s3UploadFile: {
    Bucket: string;
    Key: string;
    Body: any;
    ContentType: string;
  }
) => {
  return s3.upload(s3UploadFile).promise();
};

export const updatePublicAccessBlock = async (
  s3: AWS.S3,
  bucketName: string
) => {
  const publicAccessBlockParams = {
    Bucket: bucketName,
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: false,
      IgnorePublicAcls: false,
      BlockPublicPolicy: false,
      RestrictPublicBuckets: false,
    },
  };

  return s3.putPublicAccessBlock(publicAccessBlockParams).promise();
};

export const updatePublicAccessPolicy = async (
  s3: AWS.S3,
  bucketName: string
) => {
  const publicAccessPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
      },
    ],
  };

  const bucketPolicyParams = {
    Bucket: bucketName,
    Policy: JSON.stringify(publicAccessPolicy),
  };

  return s3.putBucketPolicy(bucketPolicyParams).promise();
};

export async function deleteBucket(s3: AWS.S3, bucketName: string) {
  // Get all objects in the bucket
  let objects = await s3.listObjects({ Bucket: bucketName }).promise();

  // Delete all objects
  let deletePromises = objects.Contents.map((object) => {
    return s3.deleteObject({ Bucket: bucketName, Key: object.Key }).promise();
  });
  await Promise.all(deletePromises);

  // Delete the bucket
  await s3.deleteBucket({ Bucket: bucketName }).promise();
  console.log(`Bucket ${bucketName} was deleted`);
  return true;
}

// define interface for the params
export interface icreateCertificateParams {
  region: string;
  domain: string;
}

export async function createCertificate(params: icreateCertificateParams) {
  const acm = new AWS.ACM({
    region: params.region,
    accessKeyId: "aaaaa",
    secretAccessKey: "bbbbb",
  });

  const conf = {
    DomainName: params.domain,
  };

  let data = {};
  try {
    data = await acm.requestCertificate(conf).promise();
  } catch (error) {
    console.log("Errore: ", error);
    data = { error: true };
  }
  return data;
}

export const createDistribution = async (
  awsKey: string,
  awsSecret: string,
  awsZone: string,
  bucketName: string
) => {
  const cloudfront = await getCloudfrontInstance({
    aws_key: awsKey,
    aws_secret: awsSecret,
    aws_zone: awsZone,
  });

  // Create an OAI for the S3 origin
  // const cloudfrontOriginAccessIdentity = await cloudfront
  //   .createCloudFrontOriginAccessIdentity({
  //     CloudFrontOriginAccessIdentityConfig: {
  //       CallerReference: Date.now().toString(),
  //       Comment: "My OAI for the S3 origin from stacking.cloud",
  //     },
  //   })
  //   .promise();

  // Get the OAI ID
  // const originAccessIdentity = cloudfrontOriginAccessIdentity.CloudFrontOriginAccessIdentity.Id;

  const params = {
    DistributionConfig: {
      CallerReference: Date.now().toString(),
      Enabled: true, // Add this line to include the missing 'Enabled' property
      Comment: "My CloudFront distribution",
      Origins: {
        Quantity: 1,
        Items: [
          {
            DomainName: `${bucketName}.s3-website.${awsZone}.amazonaws.com`,
            // a:          "prova-wow.s3-website.eu-west-1.amazonaws.com",
            Id: "CustomOrigin",
            CustomOriginConfig: {
              // OriginAccessIdentity: `origin-access-identity/cloudfront/${originAccessIdentity}`,
              HTTPPort: 80,
              HTTPSPort: 443,
              OriginProtocolPolicy: "http-only",
            },
            // S3OriginConfig: {
            //   OriginAccessIdentity: `origin-access-identity/cloudfront/${originAccessIdentity}`,
            // },
          },
        ],
      },
      Logging: {
        Enabled: false,
        Bucket: "",
        Prefix: "",
        IncludeCookies: false,
      },
      DefaultCacheBehavior: {
        TargetOriginId: "CustomOrigin",
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
        ViewerProtocolPolicy: "redirect-to-https",
        MinTTL: 0,
        AllowedMethods: {
          Quantity: 2,
          Items: ["GET", "HEAD"],
          CachedMethods: {
            Quantity: 2,
            Items: ["GET", "HEAD"],
          },
        },
      },
    },
  };

  return cloudfront.createDistribution(params).promise();
};
