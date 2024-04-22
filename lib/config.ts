import * as dotenv from "dotenv";
import path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export type ConfigProps = {
  REGION: string;
  ACCOUNT: string;
  CIDR: string;
  MAX_AZS: number;
  CHART: string;
  REPOSITORY: string;
  NAMESPACE: string;
  VAULT_RELEASE_NAME: string,
  VAULTINIT_RELEASE_NAME: string,
  C_RELEASE_NAME: string,
  R_RELEASE_NAME: string,
  RC_RELEASE_NAME: string,
  RDS_USER: string;
  RDS_PASSWORD: string;
  RDS_SEC_GRP_INGRESS: string;
  ROLE_ARN: string;
  EKS_CLUSTER_NAME: string;
  SUNBIRD_RC_MODULES_CHOICE: string;

};

// configuration values 
export const getConfig = (): ConfigProps => ({
  REGION: process.env.REGION || "ap-south-1",
  ACCOUNT: process.env.ACCOUNT || "",
  CIDR: process.env.CIDR || "",
  MAX_AZS: Number(process.env.MAZ_AZs) || 2,
  CHART: "sunbird_rc_charts",
  REPOSITORY: "https://dpgonaws.github.io/dpg-helm",
  NAMESPACE: "sbrc2",
  VAULT_RELEASE_NAME: "sbrc2",
  C_RELEASE_NAME: "sbrc2-c",
  R_RELEASE_NAME: "sbrc2-r",
  RC_RELEASE_NAME: "sbrc2-rc",
  VAULTINIT_RELEASE_NAME: "sbrc2-i",
  RDS_USER: process.env.RDS_USER || "postgres",
  RDS_PASSWORD: process.env.RDS_PASSWORD || "",
  RDS_SEC_GRP_INGRESS: process.env.CIDR || "",
  ROLE_ARN: process.env.ROLE_ARN || "",
  EKS_CLUSTER_NAME: process.env.EKS_CLUSTER_NAME || "ekscluster-sbrc2",
  SUNBIRD_RC_MODULES_CHOICE: process.env.SUNBIRD_RC_MODULES_CHOICE || "RC",
});