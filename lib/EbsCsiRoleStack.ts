import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from "constructs";
import { ConfigProps } from "./config";

export class EbsCsiRoleStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

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

        // Output the ARN of the created role
        new cdk.CfnOutput(this, 'EbsCsiRoleArn', {
            value: ebsCsiRole.roleArn,
        });
    }
}

const app = new cdk.App();
new EbsCsiRoleStack(app, 'EbsCsiRoleStack');
