import axios from "axios";
import { IDigitalOceanRequestProps } from "./types";

export const DigitalOceanService = {
  baseUrl: "https://api.digitalocean.com/v2",
  defaultOptions: {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  },
  params: {},

  async getInstance() {
    const options = {
      ...this.defaultOptions,
      url: `${this.baseUrl}/droplets`,
      headers: {
        ...this.defaultOptions.headers,
        Authorization: `Bearer ${this.params.accessKey}`,
      },
    };

    return await axios.request(options);
  },

  get requestParams() {
    return this.params;
  },

  set requestParams(params: IDigitalOceanRequestProps) {
    this.params = params;
  },
};
