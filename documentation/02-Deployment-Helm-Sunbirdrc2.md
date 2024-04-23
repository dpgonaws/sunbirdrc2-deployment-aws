# Sunbird RC Services Helm Chart

This Helm chart provides a convenient way to deploy the Sunbird RC services, which includes various microservices and components. 

# Prerequisites

Before deploying this Helm chart, ensure you have the following prerequisites in place:

1. [Git](https://git-scm.com/)
2. [Helm](https://helm.sh/) (installed on your local machine)
3. [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) (installed on your local machine)
4. Access to a Kubernetes cluster

## Deploying Sunbird RC – REGISTRY

#### 1. Intialized Sunbird RC Helm Repository

```
helm repo add sunbird-rc  https://dpgonaws.github.io/dpg-helm
```

#### 2. Check the Helm Repo Status:
```
helm repo list
```

#### 3. Serach for Sunbrird RC Chat in Helm Repo:
```
helm search repo sunbird-rc
```

```
NAME                                CHART VERSION   APP VERSION  DESCRIPTION
testone/spar-helm-chart             0.1.0           1.0.0        A Helm chart for spar application
sunbird-rc/sunbird-c-charts         0.0.1           0.0.13       A Helm chart for Sunbird RC
sunbird-rc/sunbird-r-charts         0.0.1           0.0.13       A Helm chart for Sunbird RC
sunbird-rc/sunbird_rc_charts        0.0.1           0.0.13       A Helm chart for Sunbird RC
sunbird-rc/vault-init               0.1.0           1.16.0       A Helm chart for Kubernetes
```

#### 4. Helm Chart Sunbird RC Framework Deployment Required following User Inputs:
   
   #### Helm global deployment properites:  
    
   | Secret Key                                     | Value   | Description                         |
   | ---------------------------------------------  | ------- | ----------------------------------- |
   | global.database.host                            | XXXXYY  | RDS/Data Host Address               |
   | global.database.user                            | XXXXYY  | RDS/Data Username                   |
   | global.registry.database                        | XXXXYY  | RDS/Data Database                   |
   | global.registry.signature_provider              | XXXXYY  | dev.sunbirdrc.registry.service.impl.SignatureV1ServiceImpl                   |   
   | global.secrets.DB_PASSWORD                     | XXXXYY  | Database Password in baseencoded64 format                 |  
   | global.secrets.DB_URL                          | XXXXYY  | postgres://${rdsuser}:${RDS_PASSWORD}@${rdsHost}:5432/${credentialDBName} in baseencoded64  format         |

   
#### 5. Install or Upgrade the Sunbird RC Framework via Helm Chart:
```
helm upgrade --install <release_name> sunbird-r-charts/ -n <namespace> --create-namespace  \
--set global.database.host="XXXXYY" \
 --set global.database.user="XXXXYY" \
 --set global.registry.database="XXXXYY" \
 --set global.registry.signature_provider="dev.sunbirdrc.registry.service.impl.SignatureV1ServiceImpl" \
 --set global.secrets.DB_PASSWORD="XXXXYY" \
 --set global.secrets.DB_URL="XXXXYY"
```
Replace `<release_name>` with a name for your release.

#### 6. Monitor the deployment status using the following command:
```
watch -n .5 kubectl get pods -n <namespace>
```

#### 7. After deployment, access the services and components as required.
```bash
kubectl get pods
kubectl get deploy
kubectl get svc 
helm list
```

## Deploying Sunbird RC - CREDENTIALLING

#### 1. Install vault from hashicorp

Create a file named helm-vault-raft-values.yml and copy below content.

```
global:
  enabled: true
  namespace: "sbrc2-c"
server:
  affinity: ""
  ha:
    enabled: true
    raft:
      enabled: true
      setNodeId: true
      config: |
        cluster_name = "vault-integrated-storage"
        storage "raft" {
            path    = "/vault/data/"
        }
        listener "tcp" {
           address = "[::]:8200"
           cluster_address = "[::]:8201"
           tls_disable = "true"
        }
        service_registration "kubernetes" {}
```

```
helm install <vault_release_name> hashicorp/vault \
--version 0.24.0 \
--values helm-vault-raft-values.yml \
-n <namespace> --create-namespace
```

```
helm status <vault_release_name>  -n <namespace>
```

Wait until all vault pods are in Running state.
screenshot to be added

#### 2. Initialize vault using vault-init chart

```
helm pull sunbird-rc/vault-init --untar --destination .
```

```
helm upgrade --install <vault_init_release_name> vault-init/ -n <namespace> \
--set envVars.NAMESPACE="<namespace>" \
--set envVars.VAULT_NAME="<vault_release_name>"
```

Ensure all vault pods are in Ready state
screenshot to be added


#### 3. Helm global deployment properites:  
    
   | Secret Key                                     | Value   | Description                         |
   | ---------------------------------------------  | ------- | ----------------------------------- |
   | global.database.host                            | XXXXYY  | RDS/Data Host Address               |
   | global.database.user                            | XXXXYY  | RDS/Data Username                   |
   | global.registry.database                        | XXXXYY  | RDS/Data Database                   |
   | global.registry.signature_provider              | XXXXYY  | dev.sunbirdrc.registry.service.impl.SignatureV1ServiceImpl                   |   
   | global.secrets.DB_PASSWORD                     | XXXXYY  | Database Password in baseencoded64 format                 |  
   | global.secrets.DB_URL                          | XXXXYY  | postgres://${rdsuser}:${RDS_PASSWORD}@${rdsHost}:5432/${credentialDBName} in baseencoded64  format         |
   | global.vault.address                            | XXXXYY  | http://<vault_release_name>:8200   |
   | global.vault.base_url                           | XXXXYY |http://<vault_release_name>:8200/v1     |
   | global.vault.root_path                          | XXXXYY  |http://<vault_release_name>:8200/v1/kv  |


#### 4. Deploy Credential app

```
helm upgrade --install <release_name> sunbird-c-charts/ -n <namespace> --create-namespace  \
--set global.database.host="XXXXYY" \
 --set global.database.user="XXXXYY" \
 --set global.registry.database="XXXXYY" \
 --set global.registry.signature_provider="dev.sunbirdrc.registry.service.impl.SignatureV2ServiceImpl" \
 --set global.secrets.DB_PASSWORD="XXXXYY" \
 --set global.secrets.DB_URL="XXXXYY" \
 --set global.vault.address="XXXXYY" \
 --set global.vault.base_url="XXXXYY" \
 --set global.vault.root_path="XXXXYY" \

```

```
watch -n .5 kubectl get pods -n <namespace>
```

## Deploying Sunbird RC - REGISTRY_AND_CREDENTIALLING


Execute [Install vault from hashicorp](#1-install-vault-from-hashicorp)  using new namespace

Execute [Initialize the vault using vault-init](#2-initialize-vault-using-vault-init-chart) 

```
helm pull sunbird-rc/sunbird_rc_charts --untar --destination . 
```


```
helm upgrade --install <release_name> sunbird_rc_charts/ -n <namespace> --create-namespace  \
--set global.database.host="XXXXYY" \
 --set global.database.user="XXXXYY" \
 --set global.registry.database="XXXXYY" \
 --set global.registry.signature_provider="dev.sunbirdrc.registry.service.impl.SignatureV2ServiceImpl" \
 --set global.secrets.DB_PASSWORD="XXXXYY" \
 --set global.secrets.DB_URL="XXXXYY" \
 --set global.vault.address="XXXXYY" \
 --set global.vault.base_url="XXXXYY" \
 --set global.vault.root_path="XXXXYY" \
```


```
watch -n .5 kubectl get pods -n <namespace>
```

