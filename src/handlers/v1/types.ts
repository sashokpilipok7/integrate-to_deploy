import { Document } from "mongoose";

export const deployStatus = {
  deployed: "deployed",
  deploying: "deploying",
  notDeployed: "not-deployed",
  error: "error",
};

export interface ISiteProps {
  name: string;
  url: string[];
  siteId: string;
  userId: string;
  username: string;
  status: keyof typeof deployStatus;
  connectionInfo: IConnectionInfo;
  connectionVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SiteSchemeProps = Document & ISiteProps;

export interface IConnectionInfo {
  type: string;
  key: string;
  secretKey: string;
  region: string;
}
