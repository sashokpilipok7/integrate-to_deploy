export interface IDigitalOceanRequestProps {
  accessKey: string;
  region?: string;
}

export interface IUploadFileProps {
  fileContent: Buffer;
  fileName: string;
  path: string;
  StorageZoneId?: string;
}
