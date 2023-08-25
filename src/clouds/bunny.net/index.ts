import axios from "axios";
import {
  IBunnyRequestProps,
  IUploadFileProps,
  StorageZoneProps,
} from "./types";

export const BunnyNetService = {
  baseUrl: "https://api.bunny.net",
  defaultOptions: {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  },
  params: {},

  async addStorageZone(storageZoneName: string) {
    const options = {
      ...this.defaultOptions,
      method: "POST",
      url: `${this.baseUrl}/storagezone`,
      headers: {
        ...this.defaultOptions.headers,
        "content-type": "application/json",
        AccessKey: this.params.AccessKey,
      },
      data: {
        ZoneTier: this.params.ZoneTier,
        Name: storageZoneName,
        Region: this.params.Region,
      },
    };

    const { data } = await axios.request(options);
    await this.getStorageZoneDetails(storageZoneName);

    return data;
  },

  async addPullZone(pullZoneName: string) {
    const options = {
      ...this.defaultOptions,
      method: "POST",
      url: `${this.baseUrl}/pullzone`,
      headers: {
        ...this.defaultOptions.headers,
        "content-type": "application/json",
        AccessKey: this.params.AccessKey,
      },
      data: {
        Name: pullZoneName,
        Type: this.params.Type,
        StorageZoneId: this.params.StorageZoneId,
      },
    };

    const { data } = await axios.request(options);

    return data;
  },

  createStorageZoneName(name: string): string {
    return `sc-${name}-storage-zone`;
  },

  createPullZoneName(name: string): string {
    return `sc-${name}-pull-zone`;
  },

  async getInstance() {
    const options = {
      ...this.defaultOptions,
      url: `${this.baseUrl}/statistics`,
      headers: {
        ...this.defaultOptions.headers,
        AccessKey: this.params.AccessKey,
      },
    };

    return await axios.request(options);
  },

  async getUrls(): Promise<string[]> {
    return await this.params.StorageZoneHostnames;
  },

  async getStorageZoneDetails(storageZoneName: string) {
    const options = {
      ...this.defaultOptions,
      url: `${this.baseUrl}/storagezone`,
      headers: {
        ...this.defaultOptions.headers,
        AccessKey: this.params.AccessKey,
      },
    };

    const { data } = await axios.request(options);
    const zone = data.find(
      (zone: StorageZoneProps): boolean => zone.Name === storageZoneName
    );

    this.params.StorageZoneId = zone.Id;
    this.params.StorageZonePassword = zone.Password;
    this.params.StorageZoneName = zone.Name;
    this.params.StorageZoneHostnames = `https://${zone.PullZones[0]?.Hostnames[0]?.Value}`;

    const {
      StorageZoneId,
      StorageZonePassword,
      StorageZoneHostnames,
      StorageZoneName,
    } = this.params;

    return {
      StorageZoneId,
      StorageZonePassword,
      StorageZoneHostnames,
      StorageZoneName,
    };
  },

  async uploadFile({
    path,
    fileName,
    fileContent,
    StorageZoneId,
  }: IUploadFileProps): Promise<any> {
    const options = {
      ...this.defaultOptions,
      method: "PUT",
      url: `https://storage.bunnycdn.com/${this.params.StorageZoneName}/${path}/${fileName}`,
      headers: {
        ...this.defaultOptions.headers,
        "content-type": "application/octet-stream",
        AccessKey: this.params.StorageZonePassword ?? StorageZoneId,
      },
      data: fileContent,
    };

    const { data } = await axios.request(options);

    return data;
  },

  get requestParams() {
    return this.params;
  },

  set requestParams(params: IBunnyRequestProps) {
    this.params = params;
  },
};
