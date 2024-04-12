import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import * as helm from "aws-cdk-lib/aws-eks";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sm from "aws-cdk-lib/aws-secretsmanager";
import { ISecret, Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { ConfigProps } from "./config";

export interface helmStackProps extends cdk.StackProps {
    config: ConfigProps;
    vpc: ec2.Vpc;
    rdssecret: string;
    eksCluster: eks.FargateCluster;
    rdsHost: string;
    RDS_PASSWORD: string;
    RDS_USER: string;
    SPAR_CORE_AUTH_DEFAULT_ISSUERS: string;
    SPAR_CORE_AUTH_DEFAULT_JWKS_URLS: string;

}

export class helmStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: helmStackProps) {
        super(scope, id, props);
        const vpc = props.vpc;
        const eksCluster = props.eksCluster;
        const rdssecretARN = props.rdssecret;
        const RDS_PASSWORD = props.RDS_PASSWORD;

        const secretName = sm.Secret.fromSecretAttributes(this, "ImportedSecret", {
            secretCompleteArn: rdssecretARN,
        });
        const getValueFromSecret = (secret: ISecret, key: string): string => {
            return secret.secretValueFromJson(key).unsafeUnwrap();
        };
        const dbPass = getValueFromSecret(secretName, "password");

        const base64encodedDBpass = cdk.Fn.base64(RDS_PASSWORD);


        const chart = props.config.CHART;
        const repository = props.config.REPOSITORY;
        const namespace = props.config.NAMESPACE;
        const release = props.config.RELEASE;
        const rdsHost = props.rdsHost;
        const rdsuser = props.RDS_USER;
        const sparcoreauthissuer = props.SPAR_CORE_AUTH_DEFAULT_ISSUERS;
        const sparcoreauthjwksurl = props.SPAR_CORE_AUTH_DEFAULT_JWKS_URLS;

        new helm.HelmChart(this, "cdkhelm", {
            cluster: eksCluster,
            chart: chart,
            repository: repository,
            namespace: namespace,
            release: release,
            values: {

                envVars: {
                    SPAR_CORE_DB_HOSTNAME: rdsHost,
                    SPAR_CORE_DB_USERNAME: rdsuser,
                    SPAR_CORE_DB_DBNAME: "spardb",
                    SPAR_CORE_DB_PASSWORD: RDS_PASSWORD,
                    SPAR_CORE_AUTH_DEFAULT_ISSUERS: sparcoreauthissuer,
                    SPAR_CORE_AUTH_DEFAULT_JWKS_URLS: sparcoreauthjwksurl
                },
                sparg2pconnectidmapper: {
                    envVars: {
                        SPAR_G2PCONNECT_MAPPER_DB_HOSTNAME: rdsHost
                    }
                },

            },
        });

        new cdk.CfnOutput(this, "DB Password", {
            value: dbPass,
        });
    }
}