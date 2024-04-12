
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { ConfigProps } from "./config";
import { KubectlV29Layer } from '@aws-cdk/lambda-layer-kubectl-v29'



export interface EksEC2StackProps extends cdk.StackProps {
    config: ConfigProps;
    vpc: ec2.Vpc;
}

export class eksec2Stack extends cdk.Stack {
    public readonly eksCluster: eks.Cluster;
    constructor(scope: Construct, id: string, props: EksEC2StackProps) {
        super(scope, id, props);
        const vpc = props.vpc;
        const cidr = props.config.CIDR;
        const ROLE_ARN = props.config.ROLE_ARN;
        const EKS_CLUSTER_NAME = props.config.EKS_CLUSTER_NAME;

        const securityGroupEKS = new ec2.SecurityGroup(this, "EKSSecurityGroup", {
            vpc: vpc,
            allowAllOutbound: true,
            description: "Security group for EKS",
        });

        securityGroupEKS.addIngressRule(
            ec2.Peer.ipv4(cidr),
            ec2.Port.allTraffic(),
            "Allow EKS traffic"
        );


        const principal = new iam.WebIdentityPrincipal('cognito-identity.amazonaws.com', {
            'StringEquals': { 'cognito-identity.amazonaws.com:aud': 'us-east-2:12345678-abcd-abcd-abcd-123456' },
            'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'unauthenticated' },
        });

        const iamRole = iam.Role.fromRoleArn(this, "MyIAMRole", ROLE_ARN);

        const readonlyRole = new iam.Role(this, "ReadOnlyRole", {
            assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
        });

        readonlyRole.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName("ReadOnlyAccess")
        );


        this.eksCluster = new eks.Cluster(this, "eksec2Cluster", {
            vpc: vpc,
            vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }],
            defaultCapacity: 1,
            defaultCapacityInstance: new ec2.InstanceType("t2.medium"),
            kubectlLayer: new KubectlV29Layer(this, "kubectl"),
            version: eks.KubernetesVersion.V1_29,
            securityGroup: securityGroupEKS,
            endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,
            ipFamily: eks.IpFamily.IP_V4,
            clusterName: EKS_CLUSTER_NAME,
            mastersRole: iamRole,
            outputClusterName: true,
            outputConfigCommand: true,
            albController: {
                version: eks.AlbControllerVersion.V2_5_1,
                repository: "public.ecr.aws/eks/aws-load-balancer-controller",
            },

        });



        /*
        this.eksCluster.addNodegroupCapacity("custom-node-group", {
            amiType: eks.NodegroupAmiType.AL2_X86_64,
            instanceTypes: [new ec2.InstanceType("t2.small")],
            desiredSize: 3,
            diskSize: 20,
            nodeRole: new iam.Role(this, "eksClusterNodeGroupRole", {
                roleName: "eksClusterNodeGroupRole",
                assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
                managedPolicies: [
                    iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSWorkerNodePolicy"),
                    iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ContainerRegistryReadOnly"),
                    iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKS_CNI_Policy"),
                ],
            }),
        });
*/

        /*
                // Managed Addon: kube-proxy
                const kubeProxy = new eks.CfnAddon(this, "addonKubeProxy", {
                    addonName: "kube-proxy",
                    clusterName: this.eksCluster.clusterName,
                });
        
                // Managed Addon: coredns
                const coreDns = new eks.CfnAddon(this, "addonCoreDns", {
                    addonName: "coredns",
                    clusterName: this.eksCluster.clusterName,
                });
        
                // Managed Addon: vpc-cni
                const vpcCni = new eks.CfnAddon(this, "addonVpcCni", {
                    addonName: "vpc-cni",
                    clusterName: this.eksCluster.clusterName,
                });
        */



        const ebscsi = new eks.CfnAddon(this, "addonEbsCsi",
            {
                addonName: "aws-ebs-csi-driver",
                clusterName: this.eksCluster.clusterName,
                serviceAccountRoleArn: "arn:aws:iam::370803901956:role/AmazonEKS_EBS_CSI_DriverRole"
            }
        );

        



        new cdk.CfnOutput(this, "EKS Cluster Name", {
            value: this.eksCluster.clusterName,
        });
        new cdk.CfnOutput(this, "EKS Cluster Arn", {
            value: this.eksCluster.clusterArn,
        });


    }
}