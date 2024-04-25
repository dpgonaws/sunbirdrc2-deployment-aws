## AWS CDK One Click Deployment ##

## Prerequisties:
To get started with CDK, it's easier to set up an AWS Cloud9 environment, which provides you with a code editor and a terminal that runs in a web browser. Configure AWS CLI in your local environment or on a remote server of your choice.

### CDK Stack list
    vpcstacksbrc2, rdsstacksbrc2, eksstacksbrc2, vaulthelmstacksbrc2, vaultinithelmstacksbrc2, sunbirdrc2helmStacksbrc2

### AWS CDK Stack Overview
The CDK comprises stacks designed to perform unique provisioning steps, making the overall automation modular. Here is an overview of all the stacks along with the actions they perform:

    bin/sunbirdrc2-cdk.ts - Is the entrypoint of the CDK application.
    config.ts  -  Input file for CDK Deployment including defaults ( AWS Account Number, Region, Bucket Name etc., )
    vpc-stack.ts  -  Foundation stack creation including VPC, Subnets, Route tables, NatGW etc.,
    rds-stack.ts  - Creates RDS Aurora Postgresql cluster
    eks-ec2-stack.ts  - To create EKS EC2 Cluster    
    sunbirdrc2-helm-stack.ts - To deploy Sunbird RC helm chart
    helm-vault-stack.ts - To deploy Vault from Hashicorp
    helm-vaultInit-stack..ts - To initialize and unseal the deployed Vault


### Prepare your environment
```
# Install TypeScript globally for CDK
npm i -g typescript

# Install aws cdk
npm i -g aws-cdk

# Clone the repository 
git clone <repo_url>
cd sunbird-rc2-aws-automation

# Install the CDK application
npm i

# cdk bootstrap [aws://ACCOUNT-NUMBER-1/REGION-1]
cdk bootstrap aws://ACCOUNT-NUMBER-1/REGION-1
```

#### Update mandatory environment variables, with your preferred editor open '.env' file

   | Secret Key                | Description                                 | 
   | ------------------------- | ------------------------------------------- | 
   | REGION                    | XXXXYY                                      | 
   | ACCOUNT                   | XXXXYY                                      | 
   | CIDR                      | VPC CIDR, change it as per your environment | 
   | MAX_AZS                   | AWS Availability Zone count, default 2      |
   | RDS_USER                  | Database user name for core registory service, default 'postgres'  |
   | RDS_PASSWORD              | Database password, used while DB creation and passed down to Sunbrd RC services helm chart  |
   | EKS_CLUSTER_NAME          | AWS EKS Cluster name                        |
   | ROLE_ARN                  | Amazon EKS mastersRole, to be associated with the system:masters RBAC group, giving super-user access to the cluster  |
   | SUNBIRD_RC_MODULES_CHOICE | Modules to be insalled as part of this deployment. Values may be  'R -     Registry,  'C' - Credentialling, 'RC' - registryAndCredentialling. Default value is RC'    |

**Deploy CDK**
```
# After updating the env file, run AWS CDK commands to begin with deploy

# emits the synthesized CloudFormation template
cdk synth 

# List CDK stack
cdk list

# Deploy single stack. Ensure order is maintained - vpcstacksbrc2, rdsstacksbrc2, eksstacksbrc2,sunbirdrc2helmStacksbrc2


cdk deploy <stack_name>

# Alternatively you could also deploy all stacks and CDK would handle the sequence
cdk deploy --all 
```

After installing all the CDK stacks, verify the AWS services in the AWS web console. The stack 'sunbirdrc2helmStacksbrc2' installs the Sunbird RC helm chart and all associated services in the EKS cluster. It is recommended to review the [Deployment through Helm](02-Deployment-Helm-Sunbirdrc2.md) guide to become familiar with Helm charts, services, and parameters. This will be beneficial if you opt to run the Helm chart separately from the CDK, following the "Mode Two: Direct Helm Chart Invocation" approach for installing the Sunbird RC stack.

Follow the post installation steps to start using Sunbird RC2.0 services

* [Post Installation Procedure](03-Post-Installation-Procedure.md)

**Lastly, if you wish to clean up, run 'AWS CDK destroy' to remove all AWS resources that were created by it.**
```
cdk destroy [STACKS..]
```
