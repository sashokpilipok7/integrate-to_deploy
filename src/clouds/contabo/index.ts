import axios from "axios";
import { IContaboRequestProps } from "./types";

export const ContaboService = {
  baseUrl: "https://api.contabo.com/v1",
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
      url: `${this.baseUrl}/compute/instances`,
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

  set requestParams(params: IContaboRequestProps) {
    this.params = params;
  },
};
