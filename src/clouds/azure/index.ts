import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

export const AzureService = {
  containerDefaultName: "$web",
  endpoints(): string[] {
    return [
      `https://${this.params.accountName}.z6.web.core.windows.net`,
      `https://${this.params.accountName}-secondary.z6.web.core.windows.net`,
    ];
  },
  params: {},

  async createBlobServiceClient(): Promise<BlobServiceClient> {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      this.params.accountName,
      this.params.accountKey
    );

    const blobServiceClient = await new BlobServiceClient(
      `https://${this.params.accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    return blobServiceClient;
  },

  async getInstance(): Promise<void> {
    const blobServiceClient = await this.createBlobServiceClient();
    const containerList = blobServiceClient.listContainers();

    for await (const container of containerList) {
      console.log(`Container: ${container.name}`);
    }
  },

  getUrls(folderName: string): string[] {
    return this.endpoints().map(
      (endpoint: string) => `${endpoint}/${folderName}`
    );
  },

  get requestParams() {
    return this.params;
  },

  set requestParams(params) {
    this.params = params;
  },
};
