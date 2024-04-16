import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import * as helm from "aws-cdk-lib/aws-eks";
import * as iam from "aws-cdk-lib/aws-iam";
import * as pipelines from "aws-cdk-lib/pipelines"
import * as sm from "aws-cdk-lib/aws-secretsmanager";
import { ISecret, Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { ConfigProps } from "./config";

export interface helmStackProps extends cdk.StackProps {
    config: ConfigProps;
    vpc: ec2.Vpc;
    rdssecret: string;
    eksCluster: eks.Cluster;
    rdsHost: string;
    RDS_PASSWORD: string;
    RDS_USER: string;


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

        //create vault
        new helm.HelmChart(this, "cdkhelm", {
            cluster: eksCluster,
            chart: "vault",
            namespace: namespace,
            createNamespace: true,
            release: release,
            version: "0.24.0",
            wait: true,
            repository: "https://helm.releases.hashicorp.com/",
            values: {
                global: {
                    namespace: namespace
                },
                server: {
                    affinity: "",
                    ha: {
                        enabled: true,
                        raft: {
                            enabled: true,
                            setNodeId: true,
                            config: "cluster_name = \"vault-integrated-storage\"\nstorage \"raft\" {\n   path    = \"/vault/data/\"\n}\n\nlistener \"tcp\" {\n   address = \"[::]:8200\"\n   cluster_address = \"[::]:8201\"\n   tls_disable = \"true\"\n}\nservice_registration \"kubernetes\" {}\n"
                        }
                    }
                },
            },
        });


        //configure vault


        /*
        // deploy SUn Bird RC 2.0
        
                new helm.HelmChart(this, "cdksbrc2helm", {
                    cluster: eksCluster,
                    chart: chart,
                    namespace: namespace,
                    createNamespace: true,
                    release: release,
                    wait: true,
                    repository: repository,
                    values: {
                        global: {
                            database:
                            {
                                host: "rdsstack-databaseb269d8bb-wtjrn0lxj2sw.cluster-cveklit2rj4m.ap-south-1.rds.amazonaws.com",
                                user: "postgres"
                            },
                            registry:
                            {
                                database: "registryrc",
                                search_provider: "dev.sunbirdrc.registry.service.NativeSearchService",
                                signature_provider: "dev.sunbirdrc.registry.service.impl.SignatureV2ServiceImpl",
                                sso:
                                {
                                    realm: "sunbird-rc",
                                    admin_client_id: "admin-api",
                                    client_id: "registry-frontend",
                                },
                                signature_enabled: true,
                                keycloak_user_set_password: false,
                                base_apis_enabled: false,
                                log_level: "DEBUG",
                                enable_external_templates: true,
                                enable_async: false,
                                enable_authentication: true,
                                enable_webhook: false,
                                webhook_url: "http://localhost:5001/api/v1/callback",
                                manager_type: "DefinitionsManager",
                                swagger_enabled: true,
                                swagger_title: "SUNBIRD-RC",
                                authentication_enabled: true,
                                claims_enabled: true,
                                certificate_enabled: true,
                                encryption_enabled: false,
                                idgen_enabled: false,
                                opa_enabled: false,
                                opa_allow_key_name: "authorized",
                                encryption_port: 8013,
                                context_path: "/",
                                idformatFromMdms: false,
                                mdmsProvider: "org.egov.id.masterdata.provider.DBMasterDataProvider",
                                autoCreateNewSeq: true,
                                migrationEnabled: true,
                                did_enabled: true,
                                credential_did_method: "rcw",
                                issuer_did_method: "issuer",
                                schema_author: "Registry",
                                schema_author_did_method: "author",
                                envVars:
                                {
                                    egov_mdms_provider: "org.egov.id.masterdata.provider.DBMasterDataProvider"
                                },
                            },
                            vault:
                            {
                                address: "http://vaultkv:8200",
                                base_url: "http://vaultkv:8200/v1",
                                root_path: "http://vaultkv:8200/v1/kv",
                                vault_timeout: 5000,
                                vault_proxy: false,
                                vault_token: "hvs.ENH0XLb5XajsNzmbO4bbZkHb"
                            },
                            sunbird:
                            {
                                enable_auth: false,
                                signing_algo: "Ed25519",
                                jwks_uri: ""
                            },
                            secrets:
                            {
                                DB_PASSWORD: "aXBkQWleay0tPUhtTW5ZQmtUeFZJVmVyLTQxdGFq",
                                ELASTIC_SEARCH_PASSWORD: "",
                                KEYCLOAK_ADMIN_CLIENT_SECRET: "YjJiMGNhYjEtMjQzZC00ZTZlLTkzZTctOTAxNWZmNjZkZjJi",
                                KEYCLOAK_ADMIN_PASSWORD: "YWRtaW4xMjM =",
                                KEYCLOAK_DEFAULT_USER_PASSWORD: "YWRtaW5AMTIz",
                                VAULT_SECRET_TOKEN: "aHZzLkVOSDBYTGI1WGFqc056bWJPNGJiWmtIYg==",
                                DB_URL: "cG9zdGdyZXM6Ly9wb3N0Z3JlczppcGRBaV5rLS09SG1NbllCa1R4VklWZXItNDF0YWpAcmRzc3RhY2stZGF0YWJhc2ViMjY5ZDhiYi13dGpybjBseGoyc3cuY2x1c3Rlci1jdmVrbGl0MnJqNG0uYXAtc291dGgtMS5yZHMuYW1hem9uYXdzLmNvbTo1NDMyL3N1bmJpcmRyY2NyZWQ=",
                            }
                        }
        
                    },
                });
                */


        new cdk.CfnOutput(this, "DB Password", {
            value: dbPass,
        });
    }
}