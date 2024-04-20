import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import * as helm from "aws-cdk-lib/aws-eks";
import * as sm from "aws-cdk-lib/aws-secretsmanager";
import { ISecret, Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { ConfigProps } from "./config";

export interface sunbirdrc2helmStackProps extends cdk.StackProps {
    config: ConfigProps;
    vpc: ec2.Vpc;
    rdssecret: string;
    eksCluster: eks.Cluster;
    rdsHost: string;
    RDS_PASSWORD: string;
    RDS_USER: string;
}

export class sunbirdrc2helmStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: sunbirdrc2helmStackProps) {
        super(scope, id, props);

        const registryChartName = "sunbird-r-charts";
        const credentialingChartName = "sunbird-c-charts"
        var rcchatName = "sunbird_rc_charts";

        const registryReleaseName = `${release}-r`;
        const credentialingReleaseName = `${release}-c`;
        const rcReleaseName = `${release}`;



        switch (repository) {
            case "RC":
                rcchatName = "sunbird_rc_charts";

                this.SunBirdRC2DeployMethod(props, rcchatName);
                break;
            case "R":
                rcchatName = "sunbird-r-charts";
                break;
            case "C":
                rcchatName = "sunbird-c-charts";
                break;
        }


        // deploy SUn Bird RC 2.0

    }

    private SunBirdRC2DeployMethod(props: sunbirdrc2helmStackProps, chartName: string, releaseName: string) {
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
        const rdsHost = props.rdsHost;
        const rdsuser = props.RDS_USER;
        const dbName = "registry";
        const logLevel = "DEBUG";
        const credentialDBName = "sunbirdrc";
        const vaultReleaseName = props.config.RELEASE;

        const dbURL = `postgres://${rdsuser}:${RDS_PASSWORD}@${rdsHost}:5432/${credentialDBName}`;
        const base64encodedDBURL = cdk.Fn.base64(dbURL);

        new helm.HelmChart(this, "cdksbrc2helm", {
            cluster: eksCluster,
            chart: chartName,
            namespace: namespace,
            createNamespace: true,
            release: releaseName,
            wait: true,
            repository: repository,
            values: {
                global: {
                    database:
                    {
                        host: rdsHost,
                        user: rdsuser
                    },
                    registry:
                    {
                        database: dbName,
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
                        log_level: logLevel,
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
                        address: `http://${vaultReleaseName}-vault:8200`, //TBC post deployment
                        base_url: `http://${vaultReleaseName}-vault:8200/v1`,
                        root_path: `http://${vaultReleaseName}-vault:8200/v1/kv`,
                        vault_timeout: 5000,
                        vault_proxy: false,
                        vault_token: "" // tobe fetched from helm
                    },
                    sunbird:
                    {
                        enable_auth: false,
                        signing_algo: "Ed25519",
                        jwks_uri: ""
                    },
                    secrets:
                    {
                        DB_PASSWORD: base64encodedDBpass,
                        ELASTIC_SEARCH_PASSWORD: "",
                        KEYCLOAK_ADMIN_CLIENT_SECRET: "",
                        KEYCLOAK_ADMIN_PASSWORD: "YWRtaW4xMjM=",
                        KEYCLOAK_DEFAULT_USER_PASSWORD: "YWRtaW5AMTIz",
                        VAULT_SECRET_TOKEN: "", // tobe fetched from helm
                        //DB_URL: "cG9zdGdyZXM6Ly9zYnJjMnVzZXI6TkxoTCpJLWU1NGVAcmRzc3RhY2tyYzItZGF0YWJhc2ViMjY5ZDhiYi1sOXFjdHFlZG55ZWYuY2x1c3Rlci1jdmVrbGl0MnJqNG0uYXAtc291dGgtMS5yZHMuYW1hem9uYXdzLmNvbTo1NDMyL3N1bmJpcmRyYw==",
                        DB_URL: base64encodedDBURL
                    }
                },
            }
        });
    }
    private VaultDeployMethod(props: sunbirdrc2helmStackProps) {

        const eksCluster = props.eksCluster;
        const vaultRepository = "https://helm.releases.hashicorp.com/";
        const vaultVersion = "0.24.0";
        const namespace = props.config.NAMESPACE;
        const release = props.config.RELEASE;

        //create vault
        new helm.HelmChart(this, "cdkhelm", {
            cluster: eksCluster,
            chart: "vault",
            namespace: namespace,
            createNamespace: true,
            release: release,
            version: vaultVersion,
            wait: true,
            repository: vaultRepository,
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
    }

    private VaultInItMethod(props: sunbirdrc2helmStackProps) {
        const eksCluster = props.eksCluster;
        const vaultInitRepository = "https://dpgonaws.github.io/dpg-helm";
        const vaulInitVersion = "0.1.0";
        const namespace = props.config.NAMESPACE;
        const release = props.config.RELEASE;
        const chart = "vault-init";
        const vaultName = `${release}-vault`;

        //create vault
        new helm.HelmChart(this, "cdkhelm", {
            cluster: eksCluster,
            chart: chart,
            namespace: namespace,
            createNamespace: true,
            release: `${release}-${chart}`,
            version: vaulInitVersion,
            wait: true,
            repository: vaultInitRepository,
            values: {
                envVars: {
                    NAMESPACE: namespace,
                    VAULT_NAME: vaultName
                }
            },
        });
    }
}