import {
  HttpRequest as __HttpRequest,
  HttpResponse as __HttpResponse,
} from "@smithy/protocol-http";
import { SerdeContext as __SerdeContext } from "@smithy/types";
import {
  AddRoleToDBClusterCommandInput,
  AddRoleToDBClusterCommandOutput,
} from "../commands/AddRoleToDBClusterCommand";
import {
  AddRoleToDBInstanceCommandInput,
  AddRoleToDBInstanceCommandOutput,
} from "../commands/AddRoleToDBInstanceCommand";
import {
  AddSourceIdentifierToSubscriptionCommandInput,
  AddSourceIdentifierToSubscriptionCommandOutput,
} from "../commands/AddSourceIdentifierToSubscriptionCommand";
import {
  AddTagsToResourceCommandInput,
  AddTagsToResourceCommandOutput,
} from "../commands/AddTagsToResourceCommand";
import {
  ApplyPendingMaintenanceActionCommandInput,
  ApplyPendingMaintenanceActionCommandOutput,
} from "../commands/ApplyPendingMaintenanceActionCommand";
import {
  AuthorizeDBSecurityGroupIngressCommandInput,
  AuthorizeDBSecurityGroupIngressCommandOutput,
} from "../commands/AuthorizeDBSecurityGroupIngressCommand";
import {
  BacktrackDBClusterCommandInput,
  BacktrackDBClusterCommandOutput,
} from "../commands/BacktrackDBClusterCommand";
import {
  CancelExportTaskCommandInput,
  CancelExportTaskCommandOutput,
} from "../commands/CancelExportTaskCommand";
import {
  CopyDBClusterParameterGroupCommandInput,
  CopyDBClusterParameterGroupCommandOutput,
} from "../commands/CopyDBClusterParameterGroupCommand";
import {
  CopyDBClusterSnapshotCommandInput,
  CopyDBClusterSnapshotCommandOutput,
} from "../commands/CopyDBClusterSnapshotCommand";
import {
  CopyDBParameterGroupCommandInput,
  CopyDBParameterGroupCommandOutput,
} from "../commands/CopyDBParameterGroupCommand";
import {
  CopyDBSnapshotCommandInput,
  CopyDBSnapshotCommandOutput,
} from "../commands/CopyDBSnapshotCommand";
import {
  CopyOptionGroupCommandInput,
  CopyOptionGroupCommandOutput,
} from "../commands/CopyOptionGroupCommand";
import {
  CreateBlueGreenDeploymentCommandInput,
  CreateBlueGreenDeploymentCommandOutput,
} from "../commands/CreateBlueGreenDeploymentCommand";
import {
  CreateCustomDBEngineVersionCommandInput,
  CreateCustomDBEngineVersionCommandOutput,
} from "../commands/CreateCustomDBEngineVersionCommand";
import {
  CreateDBClusterCommandInput,
  CreateDBClusterCommandOutput,
} from "../commands/CreateDBClusterCommand";
import {
  CreateDBClusterEndpointCommandInput,
  CreateDBClusterEndpointCommandOutput,
} from "../commands/CreateDBClusterEndpointCommand";
import {
  CreateDBClusterParameterGroupCommandInput,
  CreateDBClusterParameterGroupCommandOutput,
} from "../commands/CreateDBClusterParameterGroupCommand";
import {
  CreateDBClusterSnapshotCommandInput,
  CreateDBClusterSnapshotCommandOutput,
} from "../commands/CreateDBClusterSnapshotCommand";
import {
  CreateDBInstanceCommandInput,
  CreateDBInstanceCommandOutput,
} from "../commands/CreateDBInstanceCommand";
import {
  CreateDBInstanceReadReplicaCommandInput,
  CreateDBInstanceReadReplicaCommandOutput,
} from "../commands/CreateDBInstanceReadReplicaCommand";
import {
  CreateDBParameterGroupCommandInput,
  CreateDBParameterGroupCommandOutput,
} from "../commands/CreateDBParameterGroupCommand";
import {
  CreateDBProxyCommandInput,
  CreateDBProxyCommandOutput,
} from "../commands/CreateDBProxyCommand";
import {
  CreateDBProxyEndpointCommandInput,
  CreateDBProxyEndpointCommandOutput,
} from "../commands/CreateDBProxyEndpointCommand";
import {
  CreateDBSecurityGroupCommandInput,
  CreateDBSecurityGroupCommandOutput,
} from "../commands/CreateDBSecurityGroupCommand";
import {
  CreateDBShardGroupCommandInput,
  CreateDBShardGroupCommandOutput,
} from "../commands/CreateDBShardGroupCommand";
import {
  CreateDBSnapshotCommandInput,
  CreateDBSnapshotCommandOutput,
} from "../commands/CreateDBSnapshotCommand";
import {
  CreateDBSubnetGroupCommandInput,
  CreateDBSubnetGroupCommandOutput,
} from "../commands/CreateDBSubnetGroupCommand";
import {
  CreateEventSubscriptionCommandInput,
  CreateEventSubscriptionCommandOutput,
} from "../commands/CreateEventSubscriptionCommand";
import {
  CreateGlobalClusterCommandInput,
  CreateGlobalClusterCommandOutput,
} from "../commands/CreateGlobalClusterCommand";
import {
  CreateIntegrationCommandInput,
  CreateIntegrationCommandOutput,
} from "../commands/CreateIntegrationCommand";
import {
  CreateOptionGroupCommandInput,
  CreateOptionGroupCommandOutput,
} from "../commands/CreateOptionGroupCommand";
import {
  CreateTenantDatabaseCommandInput,
  CreateTenantDatabaseCommandOutput,
} from "../commands/CreateTenantDatabaseCommand";
import {
  DeleteBlueGreenDeploymentCommandInput,
  DeleteBlueGreenDeploymentCommandOutput,
} from "../commands/DeleteBlueGreenDeploymentCommand";
import {
  DeleteCustomDBEngineVersionCommandInput,
  DeleteCustomDBEngineVersionCommandOutput,
} from "../commands/DeleteCustomDBEngineVersionCommand";
import {
  DeleteDBClusterAutomatedBackupCommandInput,
  DeleteDBClusterAutomatedBackupCommandOutput,
} from "../commands/DeleteDBClusterAutomatedBackupCommand";
import {
  DeleteDBClusterCommandInput,
  DeleteDBClusterCommandOutput,
} from "../commands/DeleteDBClusterCommand";
import {
  DeleteDBClusterEndpointCommandInput,
  DeleteDBClusterEndpointCommandOutput,
} from "../commands/DeleteDBClusterEndpointCommand";
import {
  DeleteDBClusterParameterGroupCommandInput,
  DeleteDBClusterParameterGroupCommandOutput,
} from "../commands/DeleteDBClusterParameterGroupCommand";
import {
  DeleteDBClusterSnapshotCommandInput,
  DeleteDBClusterSnapshotCommandOutput,
} from "../commands/DeleteDBClusterSnapshotCommand";
import {
  DeleteDBInstanceAutomatedBackupCommandInput,
  DeleteDBInstanceAutomatedBackupCommandOutput,
} from "../commands/DeleteDBInstanceAutomatedBackupCommand";
import {
  DeleteDBInstanceCommandInput,
  DeleteDBInstanceCommandOutput,
} from "../commands/DeleteDBInstanceCommand";
import {
  DeleteDBParameterGroupCommandInput,
  DeleteDBParameterGroupCommandOutput,
} from "../commands/DeleteDBParameterGroupCommand";
import {
  DeleteDBProxyCommandInput,
  DeleteDBProxyCommandOutput,
} from "../commands/DeleteDBProxyCommand";
import {
  DeleteDBProxyEndpointCommandInput,
  DeleteDBProxyEndpointCommandOutput,
} from "../commands/DeleteDBProxyEndpointCommand";
import {
  DeleteDBSecurityGroupCommandInput,
  DeleteDBSecurityGroupCommandOutput,
} from "../commands/DeleteDBSecurityGroupCommand";
import {
  DeleteDBShardGroupCommandInput,
  DeleteDBShardGroupCommandOutput,
} from "../commands/DeleteDBShardGroupCommand";
import {
  DeleteDBSnapshotCommandInput,
  DeleteDBSnapshotCommandOutput,
} from "../commands/DeleteDBSnapshotCommand";
import {
  DeleteDBSubnetGroupCommandInput,
  DeleteDBSubnetGroupCommandOutput,
} from "../commands/DeleteDBSubnetGroupCommand";
import {
  DeleteEventSubscriptionCommandInput,
  DeleteEventSubscriptionCommandOutput,
} from "../commands/DeleteEventSubscriptionCommand";
import {
  DeleteGlobalClusterCommandInput,
  DeleteGlobalClusterCommandOutput,
} from "../commands/DeleteGlobalClusterCommand";
import {
  DeleteIntegrationCommandInput,
  DeleteIntegrationCommandOutput,
} from "../commands/DeleteIntegrationCommand";
import {
  DeleteOptionGroupCommandInput,
  DeleteOptionGroupCommandOutput,
} from "../commands/DeleteOptionGroupCommand";
import {
  DeleteTenantDatabaseCommandInput,
  DeleteTenantDatabaseCommandOutput,
} from "../commands/DeleteTenantDatabaseCommand";
import {
  DeregisterDBProxyTargetsCommandInput,
  DeregisterDBProxyTargetsCommandOutput,
} from "../commands/DeregisterDBProxyTargetsCommand";
import {
  DescribeAccountAttributesCommandInput,
  DescribeAccountAttributesCommandOutput,
} from "../commands/DescribeAccountAttributesCommand";
import {
  DescribeBlueGreenDeploymentsCommandInput,
  DescribeBlueGreenDeploymentsCommandOutput,
} from "../commands/DescribeBlueGreenDeploymentsCommand";
import {
  DescribeCertificatesCommandInput,
  DescribeCertificatesCommandOutput,
} from "../commands/DescribeCertificatesCommand";
import {
  DescribeDBClusterAutomatedBackupsCommandInput,
  DescribeDBClusterAutomatedBackupsCommandOutput,
} from "../commands/DescribeDBClusterAutomatedBackupsCommand";
import {
  DescribeDBClusterBacktracksCommandInput,
  DescribeDBClusterBacktracksCommandOutput,
} from "../commands/DescribeDBClusterBacktracksCommand";
import {
  DescribeDBClusterEndpointsCommandInput,
  DescribeDBClusterEndpointsCommandOutput,
} from "../commands/DescribeDBClusterEndpointsCommand";
import {
  DescribeDBClusterParameterGroupsCommandInput,
  DescribeDBClusterParameterGroupsCommandOutput,
} from "../commands/DescribeDBClusterParameterGroupsCommand";
import {
  DescribeDBClusterParametersCommandInput,
  DescribeDBClusterParametersCommandOutput,
} from "../commands/DescribeDBClusterParametersCommand";
import {
  DescribeDBClustersCommandInput,
  DescribeDBClustersCommandOutput,
} from "../commands/DescribeDBClustersCommand";
import {
  DescribeDBClusterSnapshotAttributesCommandInput,
  DescribeDBClusterSnapshotAttributesCommandOutput,
} from "../commands/DescribeDBClusterSnapshotAttributesCommand";
import {
  DescribeDBClusterSnapshotsCommandInput,
  DescribeDBClusterSnapshotsCommandOutput,
} from "../commands/DescribeDBClusterSnapshotsCommand";
import {
  DescribeDBEngineVersionsCommandInput,
  DescribeDBEngineVersionsCommandOutput,
} from "../commands/DescribeDBEngineVersionsCommand";
import {
  DescribeDBInstanceAutomatedBackupsCommandInput,
  DescribeDBInstanceAutomatedBackupsCommandOutput,
} from "../commands/DescribeDBInstanceAutomatedBackupsCommand";
import {
  DescribeDBInstancesCommandInput,
  DescribeDBInstancesCommandOutput,
} from "../commands/DescribeDBInstancesCommand";
import {
  DescribeDBLogFilesCommandInput,
  DescribeDBLogFilesCommandOutput,
} from "../commands/DescribeDBLogFilesCommand";
import {
  DescribeDBParameterGroupsCommandInput,
  DescribeDBParameterGroupsCommandOutput,
} from "../commands/DescribeDBParameterGroupsCommand";
import {
  DescribeDBParametersCommandInput,
  DescribeDBParametersCommandOutput,
} from "../commands/DescribeDBParametersCommand";
import {
  DescribeDBProxiesCommandInput,
  DescribeDBProxiesCommandOutput,
} from "../commands/DescribeDBProxiesCommand";
import {
  DescribeDBProxyEndpointsCommandInput,
  DescribeDBProxyEndpointsCommandOutput,
} from "../commands/DescribeDBProxyEndpointsCommand";
import {
  DescribeDBProxyTargetGroupsCommandInput,
  DescribeDBProxyTargetGroupsCommandOutput,
} from "../commands/DescribeDBProxyTargetGroupsCommand";
import {
  DescribeDBProxyTargetsCommandInput,
  DescribeDBProxyTargetsCommandOutput,
} from "../commands/DescribeDBProxyTargetsCommand";
import {
  DescribeDBRecommendationsCommandInput,
  DescribeDBRecommendationsCommandOutput,
} from "../commands/DescribeDBRecommendationsCommand";
import {
  DescribeDBSecurityGroupsCommandInput,
  DescribeDBSecurityGroupsCommandOutput,
} from "../commands/DescribeDBSecurityGroupsCommand";
import {
  DescribeDBShardGroupsCommandInput,
  DescribeDBShardGroupsCommandOutput,
} from "../commands/DescribeDBShardGroupsCommand";
import {
  DescribeDBSnapshotAttributesCommandInput,
  DescribeDBSnapshotAttributesCommandOutput,
} from "../commands/DescribeDBSnapshotAttributesCommand";
import {
  DescribeDBSnapshotsCommandInput,
  DescribeDBSnapshotsCommandOutput,
} from "../commands/DescribeDBSnapshotsCommand";
import {
  DescribeDBSnapshotTenantDatabasesCommandInput,
  DescribeDBSnapshotTenantDatabasesCommandOutput,
} from "../commands/DescribeDBSnapshotTenantDatabasesCommand";
import {
  DescribeDBSubnetGroupsCommandInput,
  DescribeDBSubnetGroupsCommandOutput,
} from "../commands/DescribeDBSubnetGroupsCommand";
import {
  DescribeEngineDefaultClusterParametersCommandInput,
  DescribeEngineDefaultClusterParametersCommandOutput,
} from "../commands/DescribeEngineDefaultClusterParametersCommand";
import {
  DescribeEngineDefaultParametersCommandInput,
  DescribeEngineDefaultParametersCommandOutput,
} from "../commands/DescribeEngineDefaultParametersCommand";
import {
  DescribeEventCategoriesCommandInput,
  DescribeEventCategoriesCommandOutput,
} from "../commands/DescribeEventCategoriesCommand";
import {
  DescribeEventsCommandInput,
  DescribeEventsCommandOutput,
} from "../commands/DescribeEventsCommand";
import {
  DescribeEventSubscriptionsCommandInput,
  DescribeEventSubscriptionsCommandOutput,
} from "../commands/DescribeEventSubscriptionsCommand";
import {
  DescribeExportTasksCommandInput,
  DescribeExportTasksCommandOutput,
} from "../commands/DescribeExportTasksCommand";
import {
  DescribeGlobalClustersCommandInput,
  DescribeGlobalClustersCommandOutput,
} from "../commands/DescribeGlobalClustersCommand";
import {
  DescribeIntegrationsCommandInput,
  DescribeIntegrationsCommandOutput,
} from "../commands/DescribeIntegrationsCommand";
import {
  DescribeOptionGroupOptionsCommandInput,
  DescribeOptionGroupOptionsCommandOutput,
} from "../commands/DescribeOptionGroupOptionsCommand";
import {
  DescribeOptionGroupsCommandInput,
  DescribeOptionGroupsCommandOutput,
} from "../commands/DescribeOptionGroupsCommand";
import {
  DescribeOrderableDBInstanceOptionsCommandInput,
  DescribeOrderableDBInstanceOptionsCommandOutput,
} from "../commands/DescribeOrderableDBInstanceOptionsCommand";
import {
  DescribePendingMaintenanceActionsCommandInput,
  DescribePendingMaintenanceActionsCommandOutput,
} from "../commands/DescribePendingMaintenanceActionsCommand";
import {
  DescribeReservedDBInstancesCommandInput,
  DescribeReservedDBInstancesCommandOutput,
} from "../commands/DescribeReservedDBInstancesCommand";
import {
  DescribeReservedDBInstancesOfferingsCommandInput,
  DescribeReservedDBInstancesOfferingsCommandOutput,
} from "../commands/DescribeReservedDBInstancesOfferingsCommand";
import {
  DescribeSourceRegionsCommandInput,
  DescribeSourceRegionsCommandOutput,
} from "../commands/DescribeSourceRegionsCommand";
import {
  DescribeTenantDatabasesCommandInput,
  DescribeTenantDatabasesCommandOutput,
} from "../commands/DescribeTenantDatabasesCommand";
import {
  DescribeValidDBInstanceModificationsCommandInput,
  DescribeValidDBInstanceModificationsCommandOutput,
} from "../commands/DescribeValidDBInstanceModificationsCommand";
import {
  DisableHttpEndpointCommandInput,
  DisableHttpEndpointCommandOutput,
} from "../commands/DisableHttpEndpointCommand";
import {
  DownloadDBLogFilePortionCommandInput,
  DownloadDBLogFilePortionCommandOutput,
} from "../commands/DownloadDBLogFilePortionCommand";
import {
  EnableHttpEndpointCommandInput,
  EnableHttpEndpointCommandOutput,
} from "../commands/EnableHttpEndpointCommand";
import {
  FailoverDBClusterCommandInput,
  FailoverDBClusterCommandOutput,
} from "../commands/FailoverDBClusterCommand";
import {
  FailoverGlobalClusterCommandInput,
  FailoverGlobalClusterCommandOutput,
} from "../commands/FailoverGlobalClusterCommand";
import {
  ListTagsForResourceCommandInput,
  ListTagsForResourceCommandOutput,
} from "../commands/ListTagsForResourceCommand";
import {
  ModifyActivityStreamCommandInput,
  ModifyActivityStreamCommandOutput,
} from "../commands/ModifyActivityStreamCommand";
import {
  ModifyCertificatesCommandInput,
  ModifyCertificatesCommandOutput,
} from "../commands/ModifyCertificatesCommand";
import {
  ModifyCurrentDBClusterCapacityCommandInput,
  ModifyCurrentDBClusterCapacityCommandOutput,
} from "../commands/ModifyCurrentDBClusterCapacityCommand";
import {
  ModifyCustomDBEngineVersionCommandInput,
  ModifyCustomDBEngineVersionCommandOutput,
} from "../commands/ModifyCustomDBEngineVersionCommand";
import {
  ModifyDBClusterCommandInput,
  ModifyDBClusterCommandOutput,
} from "../commands/ModifyDBClusterCommand";
import {
  ModifyDBClusterEndpointCommandInput,
  ModifyDBClusterEndpointCommandOutput,
} from "../commands/ModifyDBClusterEndpointCommand";
import {
  ModifyDBClusterParameterGroupCommandInput,
  ModifyDBClusterParameterGroupCommandOutput,
} from "../commands/ModifyDBClusterParameterGroupCommand";
import {
  ModifyDBClusterSnapshotAttributeCommandInput,
  ModifyDBClusterSnapshotAttributeCommandOutput,
} from "../commands/ModifyDBClusterSnapshotAttributeCommand";
import {
  ModifyDBInstanceCommandInput,
  ModifyDBInstanceCommandOutput,
} from "../commands/ModifyDBInstanceCommand";
import {
  ModifyDBParameterGroupCommandInput,
  ModifyDBParameterGroupCommandOutput,
} from "../commands/ModifyDBParameterGroupCommand";
import {
  ModifyDBProxyCommandInput,
  ModifyDBProxyCommandOutput,
} from "../commands/ModifyDBProxyCommand";
import {
  ModifyDBProxyEndpointCommandInput,
  ModifyDBProxyEndpointCommandOutput,
} from "../commands/ModifyDBProxyEndpointCommand";
import {
  ModifyDBProxyTargetGroupCommandInput,
  ModifyDBProxyTargetGroupCommandOutput,
} from "../commands/ModifyDBProxyTargetGroupCommand";
import {
  ModifyDBRecommendationCommandInput,
  ModifyDBRecommendationCommandOutput,
} from "../commands/ModifyDBRecommendationCommand";
import {
  ModifyDBShardGroupCommandInput,
  ModifyDBShardGroupCommandOutput,
} from "../commands/ModifyDBShardGroupCommand";
import {
  ModifyDBSnapshotAttributeCommandInput,
  ModifyDBSnapshotAttributeCommandOutput,
} from "../commands/ModifyDBSnapshotAttributeCommand";
import {
  ModifyDBSnapshotCommandInput,
  ModifyDBSnapshotCommandOutput,
} from "../commands/ModifyDBSnapshotCommand";
import {
  ModifyDBSubnetGroupCommandInput,
  ModifyDBSubnetGroupCommandOutput,
} from "../commands/ModifyDBSubnetGroupCommand";
import {
  ModifyEventSubscriptionCommandInput,
  ModifyEventSubscriptionCommandOutput,
} from "../commands/ModifyEventSubscriptionCommand";
import {
  ModifyGlobalClusterCommandInput,
  ModifyGlobalClusterCommandOutput,
} from "../commands/ModifyGlobalClusterCommand";
import {
  ModifyIntegrationCommandInput,
  ModifyIntegrationCommandOutput,
} from "../commands/ModifyIntegrationCommand";
import {
  ModifyOptionGroupCommandInput,
  ModifyOptionGroupCommandOutput,
} from "../commands/ModifyOptionGroupCommand";
import {
  ModifyTenantDatabaseCommandInput,
  ModifyTenantDatabaseCommandOutput,
} from "../commands/ModifyTenantDatabaseCommand";
import {
  PromoteReadReplicaCommandInput,
  PromoteReadReplicaCommandOutput,
} from "../commands/PromoteReadReplicaCommand";
import {
  PromoteReadReplicaDBClusterCommandInput,
  PromoteReadReplicaDBClusterCommandOutput,
} from "../commands/PromoteReadReplicaDBClusterCommand";
import {
  PurchaseReservedDBInstancesOfferingCommandInput,
  PurchaseReservedDBInstancesOfferingCommandOutput,
} from "../commands/PurchaseReservedDBInstancesOfferingCommand";
import {
  RebootDBClusterCommandInput,
  RebootDBClusterCommandOutput,
} from "../commands/RebootDBClusterCommand";
import {
  RebootDBInstanceCommandInput,
  RebootDBInstanceCommandOutput,
} from "../commands/RebootDBInstanceCommand";
import {
  RebootDBShardGroupCommandInput,
  RebootDBShardGroupCommandOutput,
} from "../commands/RebootDBShardGroupCommand";
import {
  RegisterDBProxyTargetsCommandInput,
  RegisterDBProxyTargetsCommandOutput,
} from "../commands/RegisterDBProxyTargetsCommand";
import {
  RemoveFromGlobalClusterCommandInput,
  RemoveFromGlobalClusterCommandOutput,
} from "../commands/RemoveFromGlobalClusterCommand";
import {
  RemoveRoleFromDBClusterCommandInput,
  RemoveRoleFromDBClusterCommandOutput,
} from "../commands/RemoveRoleFromDBClusterCommand";
import {
  RemoveRoleFromDBInstanceCommandInput,
  RemoveRoleFromDBInstanceCommandOutput,
} from "../commands/RemoveRoleFromDBInstanceCommand";
import {
  RemoveSourceIdentifierFromSubscriptionCommandInput,
  RemoveSourceIdentifierFromSubscriptionCommandOutput,
} from "../commands/RemoveSourceIdentifierFromSubscriptionCommand";
import {
  RemoveTagsFromResourceCommandInput,
  RemoveTagsFromResourceCommandOutput,
} from "../commands/RemoveTagsFromResourceCommand";
import {
  ResetDBClusterParameterGroupCommandInput,
  ResetDBClusterParameterGroupCommandOutput,
} from "../commands/ResetDBClusterParameterGroupCommand";
import {
  ResetDBParameterGroupCommandInput,
  ResetDBParameterGroupCommandOutput,
} from "../commands/ResetDBParameterGroupCommand";
import {
  RestoreDBClusterFromS3CommandInput,
  RestoreDBClusterFromS3CommandOutput,
} from "../commands/RestoreDBClusterFromS3Command";
import {
  RestoreDBClusterFromSnapshotCommandInput,
  RestoreDBClusterFromSnapshotCommandOutput,
} from "../commands/RestoreDBClusterFromSnapshotCommand";
import {
  RestoreDBClusterToPointInTimeCommandInput,
  RestoreDBClusterToPointInTimeCommandOutput,
} from "../commands/RestoreDBClusterToPointInTimeCommand";
import {
  RestoreDBInstanceFromDBSnapshotCommandInput,
  RestoreDBInstanceFromDBSnapshotCommandOutput,
} from "../commands/RestoreDBInstanceFromDBSnapshotCommand";
import {
  RestoreDBInstanceFromS3CommandInput,
  RestoreDBInstanceFromS3CommandOutput,
} from "../commands/RestoreDBInstanceFromS3Command";
import {
  RestoreDBInstanceToPointInTimeCommandInput,
  RestoreDBInstanceToPointInTimeCommandOutput,
} from "../commands/RestoreDBInstanceToPointInTimeCommand";
import {
  RevokeDBSecurityGroupIngressCommandInput,
  RevokeDBSecurityGroupIngressCommandOutput,
} from "../commands/RevokeDBSecurityGroupIngressCommand";
import {
  StartActivityStreamCommandInput,
  StartActivityStreamCommandOutput,
} from "../commands/StartActivityStreamCommand";
import {
  StartDBClusterCommandInput,
  StartDBClusterCommandOutput,
} from "../commands/StartDBClusterCommand";
import {
  StartDBInstanceAutomatedBackupsReplicationCommandInput,
  StartDBInstanceAutomatedBackupsReplicationCommandOutput,
} from "../commands/StartDBInstanceAutomatedBackupsReplicationCommand";
import {
  StartDBInstanceCommandInput,
  StartDBInstanceCommandOutput,
} from "../commands/StartDBInstanceCommand";
import {
  StartExportTaskCommandInput,
  StartExportTaskCommandOutput,
} from "../commands/StartExportTaskCommand";
import {
  StopActivityStreamCommandInput,
  StopActivityStreamCommandOutput,
} from "../commands/StopActivityStreamCommand";
import {
  StopDBClusterCommandInput,
  StopDBClusterCommandOutput,
} from "../commands/StopDBClusterCommand";
import {
  StopDBInstanceAutomatedBackupsReplicationCommandInput,
  StopDBInstanceAutomatedBackupsReplicationCommandOutput,
} from "../commands/StopDBInstanceAutomatedBackupsReplicationCommand";
import {
  StopDBInstanceCommandInput,
  StopDBInstanceCommandOutput,
} from "../commands/StopDBInstanceCommand";
import {
  SwitchoverBlueGreenDeploymentCommandInput,
  SwitchoverBlueGreenDeploymentCommandOutput,
} from "../commands/SwitchoverBlueGreenDeploymentCommand";
import {
  SwitchoverGlobalClusterCommandInput,
  SwitchoverGlobalClusterCommandOutput,
} from "../commands/SwitchoverGlobalClusterCommand";
import {
  SwitchoverReadReplicaCommandInput,
  SwitchoverReadReplicaCommandOutput,
} from "../commands/SwitchoverReadReplicaCommand";
export declare const se_AddRoleToDBClusterCommand: (
  input: AddRoleToDBClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_AddRoleToDBInstanceCommand: (
  input: AddRoleToDBInstanceCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_AddSourceIdentifierToSubscriptionCommand: (
  input: AddSourceIdentifierToSubscriptionCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_AddTagsToResourceCommand: (
  input: AddTagsToResourceCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ApplyPendingMaintenanceActionCommand: (
  input: ApplyPendingMaintenanceActionCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_AuthorizeDBSecurityGroupIngressCommand: (
  input: AuthorizeDBSecurityGroupIngressCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_BacktrackDBClusterCommand: (
  input: BacktrackDBClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CancelExportTaskCommand: (
  input: CancelExportTaskCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CopyDBClusterParameterGroupCommand: (
  input: CopyDBClusterParameterGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CopyDBClusterSnapshotCommand: (
  input: CopyDBClusterSnapshotCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CopyDBParameterGroupCommand: (
  input: CopyDBParameterGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CopyDBSnapshotCommand: (
  input: CopyDBSnapshotCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CopyOptionGroupCommand: (
  input: CopyOptionGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateBlueGreenDeploymentCommand: (
  input: CreateBlueGreenDeploymentCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateCustomDBEngineVersionCommand: (
  input: CreateCustomDBEngineVersionCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateDBClusterCommand: (
  input: CreateDBClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateDBClusterEndpointCommand: (
  input: CreateDBClusterEndpointCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateDBClusterParameterGroupCommand: (
  input: CreateDBClusterParameterGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateDBClusterSnapshotCommand: (
  input: CreateDBClusterSnapshotCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateDBInstanceCommand: (
  input: CreateDBInstanceCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateDBInstanceReadReplicaCommand: (
  input: CreateDBInstanceReadReplicaCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateDBParameterGroupCommand: (
  input: CreateDBParameterGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateDBProxyCommand: (
  input: CreateDBProxyCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateDBProxyEndpointCommand: (
  input: CreateDBProxyEndpointCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateDBSecurityGroupCommand: (
  input: CreateDBSecurityGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateDBShardGroupCommand: (
  input: CreateDBShardGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateDBSnapshotCommand: (
  input: CreateDBSnapshotCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateDBSubnetGroupCommand: (
  input: CreateDBSubnetGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateEventSubscriptionCommand: (
  input: CreateEventSubscriptionCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateGlobalClusterCommand: (
  input: CreateGlobalClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateIntegrationCommand: (
  input: CreateIntegrationCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateOptionGroupCommand: (
  input: CreateOptionGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_CreateTenantDatabaseCommand: (
  input: CreateTenantDatabaseCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteBlueGreenDeploymentCommand: (
  input: DeleteBlueGreenDeploymentCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteCustomDBEngineVersionCommand: (
  input: DeleteCustomDBEngineVersionCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteDBClusterCommand: (
  input: DeleteDBClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteDBClusterAutomatedBackupCommand: (
  input: DeleteDBClusterAutomatedBackupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteDBClusterEndpointCommand: (
  input: DeleteDBClusterEndpointCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteDBClusterParameterGroupCommand: (
  input: DeleteDBClusterParameterGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteDBClusterSnapshotCommand: (
  input: DeleteDBClusterSnapshotCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteDBInstanceCommand: (
  input: DeleteDBInstanceCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteDBInstanceAutomatedBackupCommand: (
  input: DeleteDBInstanceAutomatedBackupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteDBParameterGroupCommand: (
  input: DeleteDBParameterGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteDBProxyCommand: (
  input: DeleteDBProxyCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteDBProxyEndpointCommand: (
  input: DeleteDBProxyEndpointCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteDBSecurityGroupCommand: (
  input: DeleteDBSecurityGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteDBShardGroupCommand: (
  input: DeleteDBShardGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteDBSnapshotCommand: (
  input: DeleteDBSnapshotCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteDBSubnetGroupCommand: (
  input: DeleteDBSubnetGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteEventSubscriptionCommand: (
  input: DeleteEventSubscriptionCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteGlobalClusterCommand: (
  input: DeleteGlobalClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteIntegrationCommand: (
  input: DeleteIntegrationCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteOptionGroupCommand: (
  input: DeleteOptionGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeleteTenantDatabaseCommand: (
  input: DeleteTenantDatabaseCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DeregisterDBProxyTargetsCommand: (
  input: DeregisterDBProxyTargetsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeAccountAttributesCommand: (
  input: DescribeAccountAttributesCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeBlueGreenDeploymentsCommand: (
  input: DescribeBlueGreenDeploymentsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeCertificatesCommand: (
  input: DescribeCertificatesCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBClusterAutomatedBackupsCommand: (
  input: DescribeDBClusterAutomatedBackupsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBClusterBacktracksCommand: (
  input: DescribeDBClusterBacktracksCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBClusterEndpointsCommand: (
  input: DescribeDBClusterEndpointsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBClusterParameterGroupsCommand: (
  input: DescribeDBClusterParameterGroupsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBClusterParametersCommand: (
  input: DescribeDBClusterParametersCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBClustersCommand: (
  input: DescribeDBClustersCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBClusterSnapshotAttributesCommand: (
  input: DescribeDBClusterSnapshotAttributesCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBClusterSnapshotsCommand: (
  input: DescribeDBClusterSnapshotsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBEngineVersionsCommand: (
  input: DescribeDBEngineVersionsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBInstanceAutomatedBackupsCommand: (
  input: DescribeDBInstanceAutomatedBackupsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBInstancesCommand: (
  input: DescribeDBInstancesCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBLogFilesCommand: (
  input: DescribeDBLogFilesCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBParameterGroupsCommand: (
  input: DescribeDBParameterGroupsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBParametersCommand: (
  input: DescribeDBParametersCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBProxiesCommand: (
  input: DescribeDBProxiesCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBProxyEndpointsCommand: (
  input: DescribeDBProxyEndpointsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBProxyTargetGroupsCommand: (
  input: DescribeDBProxyTargetGroupsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBProxyTargetsCommand: (
  input: DescribeDBProxyTargetsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBRecommendationsCommand: (
  input: DescribeDBRecommendationsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBSecurityGroupsCommand: (
  input: DescribeDBSecurityGroupsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBShardGroupsCommand: (
  input: DescribeDBShardGroupsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBSnapshotAttributesCommand: (
  input: DescribeDBSnapshotAttributesCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBSnapshotsCommand: (
  input: DescribeDBSnapshotsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBSnapshotTenantDatabasesCommand: (
  input: DescribeDBSnapshotTenantDatabasesCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeDBSubnetGroupsCommand: (
  input: DescribeDBSubnetGroupsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeEngineDefaultClusterParametersCommand: (
  input: DescribeEngineDefaultClusterParametersCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeEngineDefaultParametersCommand: (
  input: DescribeEngineDefaultParametersCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeEventCategoriesCommand: (
  input: DescribeEventCategoriesCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeEventsCommand: (
  input: DescribeEventsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeEventSubscriptionsCommand: (
  input: DescribeEventSubscriptionsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeExportTasksCommand: (
  input: DescribeExportTasksCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeGlobalClustersCommand: (
  input: DescribeGlobalClustersCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeIntegrationsCommand: (
  input: DescribeIntegrationsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeOptionGroupOptionsCommand: (
  input: DescribeOptionGroupOptionsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeOptionGroupsCommand: (
  input: DescribeOptionGroupsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeOrderableDBInstanceOptionsCommand: (
  input: DescribeOrderableDBInstanceOptionsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribePendingMaintenanceActionsCommand: (
  input: DescribePendingMaintenanceActionsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeReservedDBInstancesCommand: (
  input: DescribeReservedDBInstancesCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeReservedDBInstancesOfferingsCommand: (
  input: DescribeReservedDBInstancesOfferingsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeSourceRegionsCommand: (
  input: DescribeSourceRegionsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeTenantDatabasesCommand: (
  input: DescribeTenantDatabasesCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DescribeValidDBInstanceModificationsCommand: (
  input: DescribeValidDBInstanceModificationsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DisableHttpEndpointCommand: (
  input: DisableHttpEndpointCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_DownloadDBLogFilePortionCommand: (
  input: DownloadDBLogFilePortionCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_EnableHttpEndpointCommand: (
  input: EnableHttpEndpointCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_FailoverDBClusterCommand: (
  input: FailoverDBClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_FailoverGlobalClusterCommand: (
  input: FailoverGlobalClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ListTagsForResourceCommand: (
  input: ListTagsForResourceCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyActivityStreamCommand: (
  input: ModifyActivityStreamCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyCertificatesCommand: (
  input: ModifyCertificatesCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyCurrentDBClusterCapacityCommand: (
  input: ModifyCurrentDBClusterCapacityCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyCustomDBEngineVersionCommand: (
  input: ModifyCustomDBEngineVersionCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyDBClusterCommand: (
  input: ModifyDBClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyDBClusterEndpointCommand: (
  input: ModifyDBClusterEndpointCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyDBClusterParameterGroupCommand: (
  input: ModifyDBClusterParameterGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyDBClusterSnapshotAttributeCommand: (
  input: ModifyDBClusterSnapshotAttributeCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyDBInstanceCommand: (
  input: ModifyDBInstanceCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyDBParameterGroupCommand: (
  input: ModifyDBParameterGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyDBProxyCommand: (
  input: ModifyDBProxyCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyDBProxyEndpointCommand: (
  input: ModifyDBProxyEndpointCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyDBProxyTargetGroupCommand: (
  input: ModifyDBProxyTargetGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyDBRecommendationCommand: (
  input: ModifyDBRecommendationCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyDBShardGroupCommand: (
  input: ModifyDBShardGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyDBSnapshotCommand: (
  input: ModifyDBSnapshotCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyDBSnapshotAttributeCommand: (
  input: ModifyDBSnapshotAttributeCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyDBSubnetGroupCommand: (
  input: ModifyDBSubnetGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyEventSubscriptionCommand: (
  input: ModifyEventSubscriptionCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyGlobalClusterCommand: (
  input: ModifyGlobalClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyIntegrationCommand: (
  input: ModifyIntegrationCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyOptionGroupCommand: (
  input: ModifyOptionGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ModifyTenantDatabaseCommand: (
  input: ModifyTenantDatabaseCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_PromoteReadReplicaCommand: (
  input: PromoteReadReplicaCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_PromoteReadReplicaDBClusterCommand: (
  input: PromoteReadReplicaDBClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_PurchaseReservedDBInstancesOfferingCommand: (
  input: PurchaseReservedDBInstancesOfferingCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RebootDBClusterCommand: (
  input: RebootDBClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RebootDBInstanceCommand: (
  input: RebootDBInstanceCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RebootDBShardGroupCommand: (
  input: RebootDBShardGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RegisterDBProxyTargetsCommand: (
  input: RegisterDBProxyTargetsCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RemoveFromGlobalClusterCommand: (
  input: RemoveFromGlobalClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RemoveRoleFromDBClusterCommand: (
  input: RemoveRoleFromDBClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RemoveRoleFromDBInstanceCommand: (
  input: RemoveRoleFromDBInstanceCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RemoveSourceIdentifierFromSubscriptionCommand: (
  input: RemoveSourceIdentifierFromSubscriptionCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RemoveTagsFromResourceCommand: (
  input: RemoveTagsFromResourceCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ResetDBClusterParameterGroupCommand: (
  input: ResetDBClusterParameterGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_ResetDBParameterGroupCommand: (
  input: ResetDBParameterGroupCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RestoreDBClusterFromS3Command: (
  input: RestoreDBClusterFromS3CommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RestoreDBClusterFromSnapshotCommand: (
  input: RestoreDBClusterFromSnapshotCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RestoreDBClusterToPointInTimeCommand: (
  input: RestoreDBClusterToPointInTimeCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RestoreDBInstanceFromDBSnapshotCommand: (
  input: RestoreDBInstanceFromDBSnapshotCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RestoreDBInstanceFromS3Command: (
  input: RestoreDBInstanceFromS3CommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RestoreDBInstanceToPointInTimeCommand: (
  input: RestoreDBInstanceToPointInTimeCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_RevokeDBSecurityGroupIngressCommand: (
  input: RevokeDBSecurityGroupIngressCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_StartActivityStreamCommand: (
  input: StartActivityStreamCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_StartDBClusterCommand: (
  input: StartDBClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_StartDBInstanceCommand: (
  input: StartDBInstanceCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_StartDBInstanceAutomatedBackupsReplicationCommand: (
  input: StartDBInstanceAutomatedBackupsReplicationCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_StartExportTaskCommand: (
  input: StartExportTaskCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_StopActivityStreamCommand: (
  input: StopActivityStreamCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_StopDBClusterCommand: (
  input: StopDBClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_StopDBInstanceCommand: (
  input: StopDBInstanceCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_StopDBInstanceAutomatedBackupsReplicationCommand: (
  input: StopDBInstanceAutomatedBackupsReplicationCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_SwitchoverBlueGreenDeploymentCommand: (
  input: SwitchoverBlueGreenDeploymentCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_SwitchoverGlobalClusterCommand: (
  input: SwitchoverGlobalClusterCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const se_SwitchoverReadReplicaCommand: (
  input: SwitchoverReadReplicaCommandInput,
  context: __SerdeContext
) => Promise<__HttpRequest>;
export declare const de_AddRoleToDBClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<AddRoleToDBClusterCommandOutput>;
export declare const de_AddRoleToDBInstanceCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<AddRoleToDBInstanceCommandOutput>;
export declare const de_AddSourceIdentifierToSubscriptionCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<AddSourceIdentifierToSubscriptionCommandOutput>;
export declare const de_AddTagsToResourceCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<AddTagsToResourceCommandOutput>;
export declare const de_ApplyPendingMaintenanceActionCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ApplyPendingMaintenanceActionCommandOutput>;
export declare const de_AuthorizeDBSecurityGroupIngressCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<AuthorizeDBSecurityGroupIngressCommandOutput>;
export declare const de_BacktrackDBClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<BacktrackDBClusterCommandOutput>;
export declare const de_CancelExportTaskCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CancelExportTaskCommandOutput>;
export declare const de_CopyDBClusterParameterGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CopyDBClusterParameterGroupCommandOutput>;
export declare const de_CopyDBClusterSnapshotCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CopyDBClusterSnapshotCommandOutput>;
export declare const de_CopyDBParameterGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CopyDBParameterGroupCommandOutput>;
export declare const de_CopyDBSnapshotCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CopyDBSnapshotCommandOutput>;
export declare const de_CopyOptionGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CopyOptionGroupCommandOutput>;
export declare const de_CreateBlueGreenDeploymentCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateBlueGreenDeploymentCommandOutput>;
export declare const de_CreateCustomDBEngineVersionCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateCustomDBEngineVersionCommandOutput>;
export declare const de_CreateDBClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateDBClusterCommandOutput>;
export declare const de_CreateDBClusterEndpointCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateDBClusterEndpointCommandOutput>;
export declare const de_CreateDBClusterParameterGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateDBClusterParameterGroupCommandOutput>;
export declare const de_CreateDBClusterSnapshotCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateDBClusterSnapshotCommandOutput>;
export declare const de_CreateDBInstanceCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateDBInstanceCommandOutput>;
export declare const de_CreateDBInstanceReadReplicaCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateDBInstanceReadReplicaCommandOutput>;
export declare const de_CreateDBParameterGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateDBParameterGroupCommandOutput>;
export declare const de_CreateDBProxyCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateDBProxyCommandOutput>;
export declare const de_CreateDBProxyEndpointCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateDBProxyEndpointCommandOutput>;
export declare const de_CreateDBSecurityGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateDBSecurityGroupCommandOutput>;
export declare const de_CreateDBShardGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateDBShardGroupCommandOutput>;
export declare const de_CreateDBSnapshotCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateDBSnapshotCommandOutput>;
export declare const de_CreateDBSubnetGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateDBSubnetGroupCommandOutput>;
export declare const de_CreateEventSubscriptionCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateEventSubscriptionCommandOutput>;
export declare const de_CreateGlobalClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateGlobalClusterCommandOutput>;
export declare const de_CreateIntegrationCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateIntegrationCommandOutput>;
export declare const de_CreateOptionGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateOptionGroupCommandOutput>;
export declare const de_CreateTenantDatabaseCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<CreateTenantDatabaseCommandOutput>;
export declare const de_DeleteBlueGreenDeploymentCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteBlueGreenDeploymentCommandOutput>;
export declare const de_DeleteCustomDBEngineVersionCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteCustomDBEngineVersionCommandOutput>;
export declare const de_DeleteDBClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteDBClusterCommandOutput>;
export declare const de_DeleteDBClusterAutomatedBackupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteDBClusterAutomatedBackupCommandOutput>;
export declare const de_DeleteDBClusterEndpointCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteDBClusterEndpointCommandOutput>;
export declare const de_DeleteDBClusterParameterGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteDBClusterParameterGroupCommandOutput>;
export declare const de_DeleteDBClusterSnapshotCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteDBClusterSnapshotCommandOutput>;
export declare const de_DeleteDBInstanceCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteDBInstanceCommandOutput>;
export declare const de_DeleteDBInstanceAutomatedBackupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteDBInstanceAutomatedBackupCommandOutput>;
export declare const de_DeleteDBParameterGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteDBParameterGroupCommandOutput>;
export declare const de_DeleteDBProxyCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteDBProxyCommandOutput>;
export declare const de_DeleteDBProxyEndpointCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteDBProxyEndpointCommandOutput>;
export declare const de_DeleteDBSecurityGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteDBSecurityGroupCommandOutput>;
export declare const de_DeleteDBShardGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteDBShardGroupCommandOutput>;
export declare const de_DeleteDBSnapshotCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteDBSnapshotCommandOutput>;
export declare const de_DeleteDBSubnetGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteDBSubnetGroupCommandOutput>;
export declare const de_DeleteEventSubscriptionCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteEventSubscriptionCommandOutput>;
export declare const de_DeleteGlobalClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteGlobalClusterCommandOutput>;
export declare const de_DeleteIntegrationCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteIntegrationCommandOutput>;
export declare const de_DeleteOptionGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteOptionGroupCommandOutput>;
export declare const de_DeleteTenantDatabaseCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeleteTenantDatabaseCommandOutput>;
export declare const de_DeregisterDBProxyTargetsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DeregisterDBProxyTargetsCommandOutput>;
export declare const de_DescribeAccountAttributesCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeAccountAttributesCommandOutput>;
export declare const de_DescribeBlueGreenDeploymentsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeBlueGreenDeploymentsCommandOutput>;
export declare const de_DescribeCertificatesCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeCertificatesCommandOutput>;
export declare const de_DescribeDBClusterAutomatedBackupsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBClusterAutomatedBackupsCommandOutput>;
export declare const de_DescribeDBClusterBacktracksCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBClusterBacktracksCommandOutput>;
export declare const de_DescribeDBClusterEndpointsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBClusterEndpointsCommandOutput>;
export declare const de_DescribeDBClusterParameterGroupsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBClusterParameterGroupsCommandOutput>;
export declare const de_DescribeDBClusterParametersCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBClusterParametersCommandOutput>;
export declare const de_DescribeDBClustersCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBClustersCommandOutput>;
export declare const de_DescribeDBClusterSnapshotAttributesCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBClusterSnapshotAttributesCommandOutput>;
export declare const de_DescribeDBClusterSnapshotsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBClusterSnapshotsCommandOutput>;
export declare const de_DescribeDBEngineVersionsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBEngineVersionsCommandOutput>;
export declare const de_DescribeDBInstanceAutomatedBackupsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBInstanceAutomatedBackupsCommandOutput>;
export declare const de_DescribeDBInstancesCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBInstancesCommandOutput>;
export declare const de_DescribeDBLogFilesCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBLogFilesCommandOutput>;
export declare const de_DescribeDBParameterGroupsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBParameterGroupsCommandOutput>;
export declare const de_DescribeDBParametersCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBParametersCommandOutput>;
export declare const de_DescribeDBProxiesCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBProxiesCommandOutput>;
export declare const de_DescribeDBProxyEndpointsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBProxyEndpointsCommandOutput>;
export declare const de_DescribeDBProxyTargetGroupsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBProxyTargetGroupsCommandOutput>;
export declare const de_DescribeDBProxyTargetsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBProxyTargetsCommandOutput>;
export declare const de_DescribeDBRecommendationsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBRecommendationsCommandOutput>;
export declare const de_DescribeDBSecurityGroupsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBSecurityGroupsCommandOutput>;
export declare const de_DescribeDBShardGroupsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBShardGroupsCommandOutput>;
export declare const de_DescribeDBSnapshotAttributesCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBSnapshotAttributesCommandOutput>;
export declare const de_DescribeDBSnapshotsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBSnapshotsCommandOutput>;
export declare const de_DescribeDBSnapshotTenantDatabasesCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBSnapshotTenantDatabasesCommandOutput>;
export declare const de_DescribeDBSubnetGroupsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeDBSubnetGroupsCommandOutput>;
export declare const de_DescribeEngineDefaultClusterParametersCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeEngineDefaultClusterParametersCommandOutput>;
export declare const de_DescribeEngineDefaultParametersCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeEngineDefaultParametersCommandOutput>;
export declare const de_DescribeEventCategoriesCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeEventCategoriesCommandOutput>;
export declare const de_DescribeEventsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeEventsCommandOutput>;
export declare const de_DescribeEventSubscriptionsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeEventSubscriptionsCommandOutput>;
export declare const de_DescribeExportTasksCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeExportTasksCommandOutput>;
export declare const de_DescribeGlobalClustersCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeGlobalClustersCommandOutput>;
export declare const de_DescribeIntegrationsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeIntegrationsCommandOutput>;
export declare const de_DescribeOptionGroupOptionsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeOptionGroupOptionsCommandOutput>;
export declare const de_DescribeOptionGroupsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeOptionGroupsCommandOutput>;
export declare const de_DescribeOrderableDBInstanceOptionsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeOrderableDBInstanceOptionsCommandOutput>;
export declare const de_DescribePendingMaintenanceActionsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribePendingMaintenanceActionsCommandOutput>;
export declare const de_DescribeReservedDBInstancesCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeReservedDBInstancesCommandOutput>;
export declare const de_DescribeReservedDBInstancesOfferingsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeReservedDBInstancesOfferingsCommandOutput>;
export declare const de_DescribeSourceRegionsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeSourceRegionsCommandOutput>;
export declare const de_DescribeTenantDatabasesCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeTenantDatabasesCommandOutput>;
export declare const de_DescribeValidDBInstanceModificationsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DescribeValidDBInstanceModificationsCommandOutput>;
export declare const de_DisableHttpEndpointCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DisableHttpEndpointCommandOutput>;
export declare const de_DownloadDBLogFilePortionCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<DownloadDBLogFilePortionCommandOutput>;
export declare const de_EnableHttpEndpointCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<EnableHttpEndpointCommandOutput>;
export declare const de_FailoverDBClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<FailoverDBClusterCommandOutput>;
export declare const de_FailoverGlobalClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<FailoverGlobalClusterCommandOutput>;
export declare const de_ListTagsForResourceCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ListTagsForResourceCommandOutput>;
export declare const de_ModifyActivityStreamCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyActivityStreamCommandOutput>;
export declare const de_ModifyCertificatesCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyCertificatesCommandOutput>;
export declare const de_ModifyCurrentDBClusterCapacityCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyCurrentDBClusterCapacityCommandOutput>;
export declare const de_ModifyCustomDBEngineVersionCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyCustomDBEngineVersionCommandOutput>;
export declare const de_ModifyDBClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyDBClusterCommandOutput>;
export declare const de_ModifyDBClusterEndpointCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyDBClusterEndpointCommandOutput>;
export declare const de_ModifyDBClusterParameterGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyDBClusterParameterGroupCommandOutput>;
export declare const de_ModifyDBClusterSnapshotAttributeCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyDBClusterSnapshotAttributeCommandOutput>;
export declare const de_ModifyDBInstanceCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyDBInstanceCommandOutput>;
export declare const de_ModifyDBParameterGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyDBParameterGroupCommandOutput>;
export declare const de_ModifyDBProxyCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyDBProxyCommandOutput>;
export declare const de_ModifyDBProxyEndpointCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyDBProxyEndpointCommandOutput>;
export declare const de_ModifyDBProxyTargetGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyDBProxyTargetGroupCommandOutput>;
export declare const de_ModifyDBRecommendationCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyDBRecommendationCommandOutput>;
export declare const de_ModifyDBShardGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyDBShardGroupCommandOutput>;
export declare const de_ModifyDBSnapshotCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyDBSnapshotCommandOutput>;
export declare const de_ModifyDBSnapshotAttributeCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyDBSnapshotAttributeCommandOutput>;
export declare const de_ModifyDBSubnetGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyDBSubnetGroupCommandOutput>;
export declare const de_ModifyEventSubscriptionCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyEventSubscriptionCommandOutput>;
export declare const de_ModifyGlobalClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyGlobalClusterCommandOutput>;
export declare const de_ModifyIntegrationCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyIntegrationCommandOutput>;
export declare const de_ModifyOptionGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyOptionGroupCommandOutput>;
export declare const de_ModifyTenantDatabaseCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ModifyTenantDatabaseCommandOutput>;
export declare const de_PromoteReadReplicaCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<PromoteReadReplicaCommandOutput>;
export declare const de_PromoteReadReplicaDBClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<PromoteReadReplicaDBClusterCommandOutput>;
export declare const de_PurchaseReservedDBInstancesOfferingCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<PurchaseReservedDBInstancesOfferingCommandOutput>;
export declare const de_RebootDBClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RebootDBClusterCommandOutput>;
export declare const de_RebootDBInstanceCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RebootDBInstanceCommandOutput>;
export declare const de_RebootDBShardGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RebootDBShardGroupCommandOutput>;
export declare const de_RegisterDBProxyTargetsCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RegisterDBProxyTargetsCommandOutput>;
export declare const de_RemoveFromGlobalClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RemoveFromGlobalClusterCommandOutput>;
export declare const de_RemoveRoleFromDBClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RemoveRoleFromDBClusterCommandOutput>;
export declare const de_RemoveRoleFromDBInstanceCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RemoveRoleFromDBInstanceCommandOutput>;
export declare const de_RemoveSourceIdentifierFromSubscriptionCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RemoveSourceIdentifierFromSubscriptionCommandOutput>;
export declare const de_RemoveTagsFromResourceCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RemoveTagsFromResourceCommandOutput>;
export declare const de_ResetDBClusterParameterGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ResetDBClusterParameterGroupCommandOutput>;
export declare const de_ResetDBParameterGroupCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<ResetDBParameterGroupCommandOutput>;
export declare const de_RestoreDBClusterFromS3Command: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RestoreDBClusterFromS3CommandOutput>;
export declare const de_RestoreDBClusterFromSnapshotCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RestoreDBClusterFromSnapshotCommandOutput>;
export declare const de_RestoreDBClusterToPointInTimeCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RestoreDBClusterToPointInTimeCommandOutput>;
export declare const de_RestoreDBInstanceFromDBSnapshotCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RestoreDBInstanceFromDBSnapshotCommandOutput>;
export declare const de_RestoreDBInstanceFromS3Command: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RestoreDBInstanceFromS3CommandOutput>;
export declare const de_RestoreDBInstanceToPointInTimeCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RestoreDBInstanceToPointInTimeCommandOutput>;
export declare const de_RevokeDBSecurityGroupIngressCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<RevokeDBSecurityGroupIngressCommandOutput>;
export declare const de_StartActivityStreamCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<StartActivityStreamCommandOutput>;
export declare const de_StartDBClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<StartDBClusterCommandOutput>;
export declare const de_StartDBInstanceCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<StartDBInstanceCommandOutput>;
export declare const de_StartDBInstanceAutomatedBackupsReplicationCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<StartDBInstanceAutomatedBackupsReplicationCommandOutput>;
export declare const de_StartExportTaskCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<StartExportTaskCommandOutput>;
export declare const de_StopActivityStreamCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<StopActivityStreamCommandOutput>;
export declare const de_StopDBClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<StopDBClusterCommandOutput>;
export declare const de_StopDBInstanceCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<StopDBInstanceCommandOutput>;
export declare const de_StopDBInstanceAutomatedBackupsReplicationCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<StopDBInstanceAutomatedBackupsReplicationCommandOutput>;
export declare const de_SwitchoverBlueGreenDeploymentCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<SwitchoverBlueGreenDeploymentCommandOutput>;
export declare const de_SwitchoverGlobalClusterCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<SwitchoverGlobalClusterCommandOutput>;
export declare const de_SwitchoverReadReplicaCommand: (
  output: __HttpResponse,
  context: __SerdeContext
) => Promise<SwitchoverReadReplicaCommandOutput>;
