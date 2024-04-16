import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from "constructs";
import { ConfigProps } from "./config";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { Console } from 'console';

export interface EbsCsiRoleStackProps extends cdk.StackProps {
    config: ConfigProps;
    vpc: ec2.Vpc;
    eksCluster: eks.Cluster;
}

export class EbsCsiRoleStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: EbsCsiRoleStackProps) {
        super(scope, id, props);
        const vpc = props.vpc;
        const eksCluster = props.eksCluster;

        /*
        // Create an IAM role with trust policy for Amazon EKS OIDC
        const ebsCsiRole = new iam.Role(this, 'EbsCsiRole', {
            assumedBy: new iam.FederatedPrincipal(`arn:${cdk.Aws.PARTITION}:iam::${cdk.Aws.ACCOUNT_ID}:oidc-provider/${cdk.Aws.URL_SUFFIX}`, {
                "StringEquals": { "oidc.eks.amazonaws.com/id/${cdk.Aws.ACCOUNT_ID}:aud": "sts.amazonaws.com" },
                "ForAnyValue:StringLike": { "oidc.eks.amazonaws.com/id/${cdk.Aws.ACCOUNT_ID}:sub": "system:serviceaccount:kube-system:ebs-csi-controller-sa" }
            }, "sts:AssumeRoleWithWebIdentity")
        });

        // Attach AWS managed policies
        // ARN of the AWS managed policy for Amazon EBS CSI driver
        const ebsCsiPolicyArn = 'arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy';

        // Create the managed policy using the ARN
        const ebsCsiPolicy = iam.ManagedPolicy.fromManagedPolicyArn(this, 'AmazonEBSCSIDriverPolicy', ebsCsiPolicyArn);

        ebsCsiRole.addManagedPolicy(ebsCsiPolicy);
        */

        // Define an IAM Role
        /*
        const oidcEKSCSIRole = new iam.Role(this, "OIDCRoleVen", {
            assumedBy: new iam.FederatedPrincipal(
                `arn:aws:iam::${this.account}:oidc-provider/${eksCluster.clusterOpenIdConnectIssuer}`,
                {
                    StringEquals: {
                        [`${eksCluster.clusterOpenIdConnectIssuer.toString()}:sub`]: `system:serviceaccount:serviceaccount:kube-system:ebs-csi-controller-sa`,
                        [`${eksCluster.clusterOpenIdConnectIssuer.toString()}:aud`]: `sts.amazonaws.com`
                    },

                },
                `sts:AssumeRoleWithWebIdentity`
            ),
        });

        // Attach a managed policy to the role
        oidcEKSCSIRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonEBSCSIDriverPolicy"))

        // Output the ARN of the created role
        new cdk.CfnOutput(this, 'EbsCsiRoleArn', {
            value: oidcEKSCSIRole.roleArn,
        });
        */

    }

    // Define an IAM Role

}