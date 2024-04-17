#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StackProps } from "aws-cdk-lib";
import { ConfigProps, getConfig } from "../lib/config";

//AWS Stacks
import { vpcStack } from "../lib/vpc-stack";
import { rdsStack } from "../lib/rds-stack";
import { eksec2Stack } from "../lib/eks-ec2-stack";
import { helmvaultStack } from "../lib/helm-vault-stack";
import { EbsCsiRoleStack } from '../lib/EbsCsiRoleStack';
import { sunbirdrc2helmStack } from "../lib/sunbirdrc2-helm-stack";
import { helmvaultinitStack } from "../lib/helm-vaultInit-stack.";


const config = getConfig();
const app = new cdk.App();

type AwsEnvStackProps = StackProps & {
    config: ConfigProps;
};

const MY_AWS_ENV_STACK_PROPS: AwsEnvStackProps = {
    env: {
        region: config.REGION,
        account: config.ACCOUNT,
    },
    config: config,
};




// Provision required VPC network & subnets
const infra = new vpcStack(app, "vpcstackrc2", MY_AWS_ENV_STACK_PROPS);

// Provision target RDS data store
const rds = new rdsStack(app, "rdsstackrc2", {
    env: {
        region: config.REGION,
        account: config.ACCOUNT,
    },
    config: config,
    vpc: infra.vpc,
    rdsuser: config.RDS_USER,
    rdspassword: config.RDS_PASSWORD,
});

// Provision target EKS with Fargate Cluster within the VPC
const eksCluster = new eksec2Stack(app, "eksstackrc2", {
    env: {
        region: config.REGION,
        account: config.ACCOUNT,
    },
    config: config,
    vpc: infra.vpc,
});



//provison role

const csiRole = new EbsCsiRoleStack(app, "ebscsirolerc2", {
    env: {
        region: config.REGION,
        account: config.ACCOUNT,
    },
    config: config,
    vpc: infra.vpc,
    eksCluster: eksCluster.eksCluster
});


// Run HELM charts for the Vault applications in the provisioned EKS cluster
new helmvaultStack(app, "helmstackrc2", {
    env: {
        region: config.REGION,
        account: config.ACCOUNT,
    },
    config: config,
    eksCluster: eksCluster.eksCluster

});

// Run HELM charts for the Vault init applications in the provisioned EKS cluster
new helmvaultinitStack(app, "helmsinitstackrc2", {
    env: {
        region: config.REGION,
        account: config.ACCOUNT,
    },
    config: config,
    eksCluster: eksCluster.eksCluster

});


// Run HELM charts for the RC2 applications in the provisioned EKS cluster
new sunbirdrc2helmStack(app, "sunbirdrc2helmStackrc2", {
    env: {
        region: config.REGION,
        account: config.ACCOUNT,
    },
    config: config,
    vpc: infra.vpc,
    rdssecret: rds.rdsSecret,
    rdsHost: rds.rdsHost,
    RDS_PASSWORD: config.RDS_PASSWORD,
    RDS_USER: config.RDS_USER,
    eksCluster: eksCluster.eksCluster

});



