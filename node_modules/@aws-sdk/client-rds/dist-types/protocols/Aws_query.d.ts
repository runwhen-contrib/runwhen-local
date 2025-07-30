import { HttpRequest as __HttpRequest, HttpResponse as __HttpResponse } from "@smithy/protocol-http";
import { SerdeContext as __SerdeContext } from "@smithy/types";
import { AddRoleToDBClusterCommandInput, AddRoleToDBClusterCommandOutput } from "../commands/AddRoleToDBClusterCommand";
import { AddRoleToDBInstanceCommandInput, AddRoleToDBInstanceCommandOutput } from "../commands/AddRoleToDBInstanceCommand";
import { AddSourceIdentifierToSubscriptionCommandInput, AddSourceIdentifierToSubscriptionCommandOutput } from "../commands/AddSourceIdentifierToSubscriptionCommand";
import { AddTagsToResourceCommandInput, AddTagsToResourceCommandOutput } from "../commands/AddTagsToResourceCommand";
import { ApplyPendingMaintenanceActionCommandInput, ApplyPendingMaintenanceActionCommandOutput } from "../commands/ApplyPendingMaintenanceActionCommand";
import { AuthorizeDBSecurityGroupIngressCommandInput, AuthorizeDBSecurityGroupIngressCommandOutput } from "../commands/AuthorizeDBSecurityGroupIngressCommand";
import { BacktrackDBClusterCommandInput, BacktrackDBClusterCommandOutput } from "../commands/BacktrackDBClusterCommand";
import { CancelExportTaskCommandInput, CancelExportTaskCommandOutput } from "../commands/CancelExportTaskCommand";
import { CopyDBClusterParameterGroupCommandInput, CopyDBClusterParameterGroupCommandOutput } from "../commands/CopyDBClusterParameterGroupCommand";
import { CopyDBClusterSnapshotCommandInput, CopyDBClusterSnapshotCommandOutput } from "../commands/CopyDBClusterSnapshotCommand";
import { CopyDBParameterGroupCommandInput, CopyDBParameterGroupCommandOutput } from "../commands/CopyDBParameterGroupCommand";
import { CopyDBSnapshotCommandInput, CopyDBSnapshotCommandOutput } from "../commands/CopyDBSnapshotCommand";
import { CopyOptionGroupCommandInput, CopyOptionGroupCommandOutput } from "../commands/CopyOptionGroupCommand";
import { CreateBlueGreenDeploymentCommandInput, CreateBlueGreenDeploymentCommandOutput } from "../commands/CreateBlueGreenDeploymentCommand";
import { CreateCustomDBEngineVersionCommandInput, CreateCustomDBEngineVersionCommandOutput } from "../commands/CreateCustomDBEngineVersionCommand";
import { CreateDBClusterCommandInput, CreateDBClusterCommandOutput } from "../commands/CreateDBClusterCommand";
import { CreateDBClusterEndpointCommandInput, CreateDBClusterEndpointCommandOutput } from "../commands/CreateDBClusterEndpointCommand";
import { CreateDBClusterParameterGroupCommandInput, CreateDBClusterParameterGroupCommandOutput } from "../commands/CreateDBClusterParameterGroupCommand";
import { CreateDBClusterSnapshotCommandInput, CreateDBClusterSnapshotCommandOutput } from "../commands/CreateDBClusterSnapshotCommand";
import { CreateDBInstanceCommandInput, CreateDBInstanceCommandOutput } from "../commands/CreateDBInstanceCommand";
import { CreateDBInstanceReadReplicaCommandInput, CreateDBInstanceReadReplicaCommandOutput } from "../commands/CreateDBInstanceReadReplicaCommand";
import { CreateDBParameterGroupCommandInput, CreateDBParameterGroupCommandOutput } from "../commands/CreateDBParameterGroupCommand";
import { CreateDBProxyCommandInput, CreateDBProxyCommandOutput } from "../commands/CreateDBProxyCommand";
import { CreateDBProxyEndpointCommandInput, CreateDBProxyEndpointCommandOutput } from "../commands/CreateDBProxyEndpointCommand";
import { CreateDBSecurityGroupCommandInput, CreateDBSecurityGroupCommandOutput } from "../commands/CreateDBSecurityGroupCommand";
import { CreateDBShardGroupCommandInput, CreateDBShardGroupCommandOutput } from "../commands/CreateDBShardGroupCommand";
import { CreateDBSnapshotCommandInput, CreateDBSnapshotCommandOutput } from "../commands/CreateDBSnapshotCommand";
import { CreateDBSubnetGroupCommandInput, CreateDBSubnetGroupCommandOutput } from "../commands/CreateDBSubnetGroupCommand";
import { CreateEventSubscriptionCommandInput, CreateEventSubscriptionCommandOutput } from "../commands/CreateEventSubscriptionCommand";
import { CreateGlobalClusterCommandInput, CreateGlobalClusterCommandOutput } from "../commands/CreateGlobalClusterCommand";
import { CreateIntegrationCommandInput, CreateIntegrationCommandOutput } from "../commands/CreateIntegrationCommand";
import { CreateOptionGroupCommandInput, CreateOptionGroupCommandOutput } from "../commands/CreateOptionGroupCommand";
import { CreateTenantDatabaseCommandInput, CreateTenantDatabaseCommandOutput } from "../commands/CreateTenantDatabaseCommand";
import { DeleteBlueGreenDeploymentCommandInput, DeleteBlueGreenDeploymentCommandOutput } from "../commands/DeleteBlueGreenDeploymentCommand";
import { DeleteCustomDBEngineVersionCommandInput, DeleteCustomDBEngineVersionCommandOutput } from "../commands/DeleteCustomDBEngineVersionCommand";
import { DeleteDBClusterAutomatedBackupCommandInput, DeleteDBClusterAutomatedBackupCommandOutput } from "../commands/DeleteDBClusterAutomatedBackupCommand";
import { DeleteDBClusterCommandInput, DeleteDBClusterCommandOutput } from "../commands/DeleteDBClusterCommand";
import { DeleteDBClusterEndpointCommandInput, DeleteDBClusterEndpointCommandOutput } from "../commands/DeleteDBClusterEndpointCommand";
import { DeleteDBClusterParameterGroupCommandInput, DeleteDBClusterParameterGroupCommandOutput } from "../commands/DeleteDBClusterParameterGroupCommand";
import { DeleteDBClusterSnapshotCommandInput, DeleteDBClusterSnapshotCommandOutput } from "../commands/DeleteDBClusterSnapshotCommand";
import { DeleteDBInstanceAutomatedBackupCommandInput, DeleteDBInstanceAutomatedBackupCommandOutput } from "../commands/DeleteDBInstanceAutomatedBackupCommand";
import { DeleteDBInstanceCommandInput, DeleteDBInstanceCommandOutput } from "../commands/DeleteDBInstanceCommand";
import { DeleteDBParameterGroupCommandInput, DeleteDBParameterGroupCommandOutput } from "../commands/DeleteDBParameterGroupCommand";
import { DeleteDBProxyCommandInput, DeleteDBProxyCommandOutput } from "../commands/DeleteDBProxyCommand";
import { DeleteDBProxyEndpointCommandInput, DeleteDBProxyEndpointCommandOutput } from "../commands/DeleteDBProxyEndpointCommand";
import { DeleteDBSecurityGroupCommandInput, DeleteDBSecurityGroupCommandOutput } from "../commands/DeleteDBSecurityGroupCommand";
import { DeleteDBShardGroupCommandInput, DeleteDBShardGroupCommandOutput } from "../commands/DeleteDBShardGroupCommand";
import { DeleteDBSnapshotCommandInput, DeleteDBSnapshotCommandOutput } from "../commands/DeleteDBSnapshotCommand";
import { DeleteDBSubnetGroupCommandInput, DeleteDBSubnetGroupCommandOutput } from "../commands/DeleteDBSubnetGroupCommand";
import { DeleteEventSubscriptionCommandInput, DeleteEventSubscriptionCommandOutput } from "../commands/DeleteEventSubscriptionCommand";
import { DeleteGlobalClusterCommandInput, DeleteGlobalClusterCommandOutput } from "../commands/DeleteGlobalClusterCommand";
import { DeleteIntegrationCommandInput, DeleteIntegrationCommandOutput } from "../commands/DeleteIntegrationCommand";
import { DeleteOptionGroupCommandInput, DeleteOptionGroupCommandOutput } from "../commands/DeleteOptionGroupCommand";
import { DeleteTenantDatabaseCommandInput, DeleteTenantDatabaseCommandOutput } from "../commands/DeleteTenantDatabaseCommand";
import { DeregisterDBProxyTargetsCommandInput, DeregisterDBProxyTargetsCommandOutput } from "../commands/DeregisterDBProxyTargetsCommand";
import { DescribeAccountAttributesCommandInput, DescribeAccountAttributesCommandOutput } from "../commands/DescribeAccountAttributesCommand";
import { DescribeBlueGreenDeploymentsCommandInput, DescribeBlueGreenDeploymentsCommandOutput } from "../commands/DescribeBlueGreenDeploymentsCommand";
import { DescribeCertificatesCommandInput, DescribeCertificatesCommandOutput } from "../commands/DescribeCertificatesCommand";
import { DescribeDBClusterAutomatedBackupsCommandInput, DescribeDBClusterAutomatedBackupsCommandOutput } from "../commands/DescribeDBClusterAutomatedBackupsCommand";
import { DescribeDBClusterBacktracksCommandInput, DescribeDBClusterBacktracksCommandOutput } from "../commands/DescribeDBClusterBacktracksCommand";
import { DescribeDBClusterEndpointsCommandInput, DescribeDBClusterEndpointsCommandOutput } from "../commands/DescribeDBClusterEndpointsCommand";
import { DescribeDBClusterParameterGroupsCommandInput, DescribeDBClusterParameterGroupsCommandOutput } from "../commands/DescribeDBClusterParameterGroupsCommand";
import { DescribeDBClusterParametersCommandInput, DescribeDBClusterParametersCommandOutput } from "../commands/DescribeDBClusterParametersCommand";
import { DescribeDBClustersCommandInput, DescribeDBClustersCommandOutput } from "../commands/DescribeDBClustersCommand";
import { DescribeDBClusterSnapshotAttributesCommandInput, DescribeDBClusterSnapshotAttributesCommandOutput } from "../commands/DescribeDBClusterSnapshotAttributesCommand";
import { DescribeDBClusterSnapshotsCommandInput, DescribeDBClusterSnapshotsCommandOutput } from "../commands/DescribeDBClusterSnapshotsCommand";
import { DescribeDBEngineVersionsCommandInput, DescribeDBEngineVersionsCommandOutput } from "../commands/DescribeDBEngineVersionsCommand";
import { DescribeDBInstanceAutomatedBackupsCommandInput, DescribeDBInstanceAutomatedBackupsCommandOutput } from "../commands/DescribeDBInstanceAutomatedBackupsCommand";
import { DescribeDBInstancesCommandInput, DescribeDBInstancesCommandOutput } from "../commands/DescribeDBInstancesCommand";
import { DescribeDBLogFilesCommandInput, DescribeDBLogFilesCommandOutput } from "../commands/DescribeDBLogFilesCommand";
import { DescribeDBParameterGroupsCommandInput, DescribeDBParameterGroupsCommandOutput } from "../commands/DescribeDBParameterGroupsCommand";
import { DescribeDBParametersCommandInput, DescribeDBParametersCommandOutput } from "../commands/DescribeDBParametersCommand";
import { DescribeDBProxiesCommandInput, DescribeDBProxiesCommandOutput } from "../commands/DescribeDBProxiesCommand";
import { DescribeDBProxyEndpointsCommandInput, DescribeDBProxyEndpointsCommandOutput } from "../commands/DescribeDBProxyEndpointsCommand";
import { DescribeDBProxyTargetGroupsCommandInput, DescribeDBProxyTargetGroupsCommandOutput } from "../commands/DescribeDBProxyTargetGroupsCommand";
import { DescribeDBProxyTargetsCommandInput, DescribeDBProxyTargetsCommandOutput } from "../commands/DescribeDBProxyTargetsCommand";
import { DescribeDBRecommendationsCommandInput, DescribeDBRecommendationsCommandOutput } from "../commands/DescribeDBRecommendationsCommand";
import { DescribeDBSecurityGroupsCommandInput, DescribeDBSecurityGroupsCommandOutput } from "../commands/DescribeDBSecurityGroupsCommand";
import { DescribeDBShardGroupsCommandInput, DescribeDBShardGroupsCommandOutput } from "../commands/DescribeDBShardGroupsCommand";
import { DescribeDBSnapshotAttributesCommandInput, DescribeDBSnapshotAttributesCommandOutput } from "../commands/DescribeDBSnapshotAttributesCommand";
import { DescribeDBSnapshotsCommandInput, DescribeDBSnapshotsCommandOutput } from "../commands/DescribeDBSnapshotsCommand";
import { DescribeDBSnapshotTenantDatabasesCommandInput, DescribeDBSnapshotTenantDatabasesCommandOutput } from "../commands/DescribeDBSnapshotTenantDatabasesCommand";
import { DescribeDBSubnetGroupsCommandInput, DescribeDBSubnetGroupsCommandOutput } from "../commands/DescribeDBSubnetGroupsCommand";
import { DescribeEngineDefaultClusterParametersCommandInput, DescribeEngineDefaultClusterParametersCommandOutput } from "../commands/DescribeEngineDefaultClusterParametersCommand";
import { DescribeEngineDefaultParametersCommandInput, DescribeEngineDefaultParametersCommandOutput } from "../commands/DescribeEngineDefaultParametersCommand";
import { DescribeEventCategoriesCommandInput, DescribeEventCategoriesCommandOutput } from "../commands/DescribeEventCategoriesCommand";
import { DescribeEventsCommandInput, DescribeEventsCommandOutput } from "../commands/DescribeEventsCommand";
import { DescribeEventSubscriptionsCommandInput, DescribeEventSubscriptionsCommandOutput } from "../commands/DescribeEventSubscriptionsCommand";
import { DescribeExportTasksCommandInput, DescribeExportTasksCommandOutput } from "../commands/DescribeExportTasksCommand";
import { DescribeGlobalClustersCommandInput, DescribeGlobalClustersCommandOutput } from "../commands/DescribeGlobalClustersCommand";
import { DescribeIntegrationsCommandInput, DescribeIntegrationsCommandOutput } from "../commands/DescribeIntegrationsCommand";
import { DescribeOptionGroupOptionsCommandInput, DescribeOptionGroupOptionsCommandOutput } from "../commands/DescribeOptionGroupOptionsCommand";
import { DescribeOptionGroupsCommandInput, DescribeOptionGroupsCommandOutput } from "../commands/DescribeOptionGroupsCommand";
import { DescribeOrderableDBInstanceOptionsCommandInput, DescribeOrderableDBInstanceOptionsCommandOutput } from "../commands/DescribeOrderableDBInstanceOptionsCommand";
import { DescribePendingMaintenanceActionsCommandInput, DescribePendingMaintenanceActionsCommandOutput } from "../commands/DescribePendingMaintenanceActionsCommand";
import { DescribeReservedDBInstancesCommandInput, DescribeReservedDBInstancesCommandOutput } from "../commands/DescribeReservedDBInstancesCommand";
import { DescribeReservedDBInstancesOfferingsCommandInput, DescribeReservedDBInstancesOfferingsCommandOutput } from "../commands/DescribeReservedDBInstancesOfferingsCommand";
import { DescribeSourceRegionsCommandInput, DescribeSourceRegionsCommandOutput } from "../commands/DescribeSourceRegionsCommand";
import { DescribeTenantDatabasesCommandInput, DescribeTenantDatabasesCommandOutput } from "../commands/DescribeTenantDatabasesCommand";
import { DescribeValidDBInstanceModificationsCommandInput, DescribeValidDBInstanceModificationsCommandOutput } from "../commands/DescribeValidDBInstanceModificationsCommand";
import { DisableHttpEndpointCommandInput, DisableHttpEndpointCommandOutput } from "../commands/DisableHttpEndpointCommand";
import { DownloadDBLogFilePortionCommandInput, DownloadDBLogFilePortionCommandOutput } from "../commands/DownloadDBLogFilePortionCommand";
import { EnableHttpEndpointCommandInput, EnableHttpEndpointCommandOutput } from "../commands/EnableHttpEndpointCommand";
import { FailoverDBClusterCommandInput, FailoverDBClusterCommandOutput } from "../commands/FailoverDBClusterCommand";
import { FailoverGlobalClusterCommandInput, FailoverGlobalClusterCommandOutput } from "../commands/FailoverGlobalClusterCommand";
import { ListTagsForResourceCommandInput, ListTagsForResourceCommandOutput } from "../commands/ListTagsForResourceCommand";
import { ModifyActivityStreamCommandInput, ModifyActivityStreamCommandOutput } from "../commands/ModifyActivityStreamCommand";
import { ModifyCertificatesCommandInput, ModifyCertificatesCommandOutput } from "../commands/ModifyCertificatesCommand";
import { ModifyCurrentDBClusterCapacityCommandInput, ModifyCurrentDBClusterCapacityCommandOutput } from "../commands/ModifyCurrentDBClusterCapacityCommand";
import { ModifyCustomDBEngineVersionCommandInput, ModifyCustomDBEngineVersionCommandOutput } from "../commands/ModifyCustomDBEngineVersionCommand";
import { ModifyDBClusterCommandInput, ModifyDBClusterCommandOutput } from "../commands/ModifyDBClusterCommand";
import { ModifyDBClusterEndpointCommandInput, ModifyDBClusterEndpointCommandOutput } from "../commands/ModifyDBClusterEndpointCommand";
import { ModifyDBClusterParameterGroupCommandInput, ModifyDBClusterParameterGroupCommandOutput } from "../commands/ModifyDBClusterParameterGroupCommand";
import { ModifyDBClusterSnapshotAttributeCommandInput, ModifyDBClusterSnapshotAttributeCommandOutput } from "../commands/ModifyDBClusterSnapshotAttributeCommand";
import { ModifyDBInstanceCommandInput, ModifyDBInstanceCommandOutput } from "../commands/ModifyDBInstanceCommand";
import { ModifyDBParameterGroupCommandInput, ModifyDBParameterGroupCommandOutput } from "../commands/ModifyDBParameterGroupCommand";
import { ModifyDBProxyCommandInput, ModifyDBProxyCommandOutput } from "../commands/ModifyDBProxyCommand";
import { ModifyDBProxyEndpointCommandInput, ModifyDBProxyEndpointCommandOutput } from "../commands/ModifyDBProxyEndpointCommand";
import { ModifyDBProxyTargetGroupCommandInput, ModifyDBProxyTargetGroupCommandOutput } from "../commands/ModifyDBProxyTargetGroupCommand";
import { ModifyDBRecommendationCommandInput, ModifyDBRecommendationCommandOutput } from "../commands/ModifyDBRecommendationCommand";
import { ModifyDBShardGroupCommandInput, ModifyDBShardGroupCommandOutput } from "../commands/ModifyDBShardGroupCommand";
import { ModifyDBSnapshotAttributeCommandInput, ModifyDBSnapshotAttributeCommandOutput } from "../commands/ModifyDBSnapshotAttributeCommand";
import { ModifyDBSnapshotCommandInput, ModifyDBSnapshotCommandOutput } from "../commands/ModifyDBSnapshotCommand";
import { ModifyDBSubnetGroupCommandInput, ModifyDBSubnetGroupCommandOutput } from "../commands/ModifyDBSubnetGroupCommand";
import { ModifyEventSubscriptionCommandInput, ModifyEventSubscriptionCommandOutput } from "../commands/ModifyEventSubscriptionCommand";
import { ModifyGlobalClusterCommandInput, ModifyGlobalClusterCommandOutput } from "../commands/ModifyGlobalClusterCommand";
import { ModifyIntegrationCommandInput, ModifyIntegrationCommandOutput } from "../commands/ModifyIntegrationCommand";
import { ModifyOptionGroupCommandInput, ModifyOptionGroupCommandOutput } from "../commands/ModifyOptionGroupCommand";
import { ModifyTenantDatabaseCommandInput, ModifyTenantDatabaseCommandOutput } from "../commands/ModifyTenantDatabaseCommand";
import { PromoteReadReplicaCommandInput, PromoteReadReplicaCommandOutput } from "../commands/PromoteReadReplicaCommand";
import { PromoteReadReplicaDBClusterCommandInput, PromoteReadReplicaDBClusterCommandOutput } from "../commands/PromoteReadReplicaDBClusterCommand";
import { PurchaseReservedDBInstancesOfferingCommandInput, PurchaseReservedDBInstancesOfferingCommandOutput } from "../commands/PurchaseReservedDBInstancesOfferingCommand";
import { RebootDBClusterCommandInput, RebootDBClusterCommandOutput } from "../commands/RebootDBClusterCommand";
import { RebootDBInstanceCommandInput, RebootDBInstanceCommandOutput } from "../commands/RebootDBInstanceCommand";
import { RebootDBShardGroupCommandInput, RebootDBShardGroupCommandOutput } from "../commands/RebootDBShardGroupCommand";
import { RegisterDBProxyTargetsCommandInput, RegisterDBProxyTargetsCommandOutput } from "../commands/RegisterDBProxyTargetsCommand";
import { RemoveFromGlobalClusterCommandInput, RemoveFromGlobalClusterCommandOutput } from "../commands/RemoveFromGlobalClusterCommand";
import { RemoveRoleFromDBClusterCommandInput, RemoveRoleFromDBClusterCommandOutput } from "../commands/RemoveRoleFromDBClusterCommand";
import { RemoveRoleFromDBInstanceCommandInput, RemoveRoleFromDBInstanceCommandOutput } from "../commands/RemoveRoleFromDBInstanceCommand";
import { RemoveSourceIdentifierFromSubscriptionCommandInput, RemoveSourceIdentifierFromSubscriptionCommandOutput } from "../commands/RemoveSourceIdentifierFromSubscriptionCommand";
import { RemoveTagsFromResourceCommandInput, RemoveTagsFromResourceCommandOutput } from "../commands/RemoveTagsFromResourceCommand";
import { ResetDBClusterParameterGroupCommandInput, ResetDBClusterParameterGroupCommandOutput } from "../commands/ResetDBClusterParameterGroupCommand";
import { ResetDBParameterGroupCommandInput, ResetDBParameterGroupCommandOutput } from "../commands/ResetDBParameterGroupCommand";
import { RestoreDBClusterFromS3CommandInput, RestoreDBClusterFromS3CommandOutput } from "../commands/RestoreDBClusterFromS3Command";
import { RestoreDBClusterFromSnapshotCommandInput, RestoreDBClusterFromSnapshotCommandOutput } from "../commands/RestoreDBClusterFromSnapshotCommand";
import { RestoreDBClusterToPointInTimeCommandInput, RestoreDBClusterToPointInTimeCommandOutput } from "../commands/RestoreDBClusterToPointInTimeCommand";
import { RestoreDBInstanceFromDBSnapshotCommandInput, RestoreDBInstanceFromDBSnapshotCommandOutput } from "../commands/RestoreDBInstanceFromDBSnapshotCommand";
import { RestoreDBInstanceFromS3CommandInput, RestoreDBInstanceFromS3CommandOutput } from "../commands/RestoreDBInstanceFromS3Command";
import { RestoreDBInstanceToPointInTimeCommandInput, RestoreDBInstanceToPointInTimeCommandOutput } from "../commands/RestoreDBInstanceToPointInTimeCommand";
import { RevokeDBSecurityGroupIngressCommandInput, RevokeDBSecurityGroupIngressCommandOutput } from "../commands/RevokeDBSecurityGroupIngressCommand";
import { StartActivityStreamCommandInput, StartActivityStreamCommandOutput } from "../commands/StartActivityStreamCommand";
import { StartDBClusterCommandInput, StartDBClusterCommandOutput } from "../commands/StartDBClusterCommand";
import { StartDBInstanceAutomatedBackupsReplicationCommandInput, StartDBInstanceAutomatedBackupsReplicationCommandOutput } from "../commands/StartDBInstanceAutomatedBackupsReplicationCommand";
import { StartDBInstanceCommandInput, StartDBInstanceCommandOutput } from "../commands/StartDBInstanceCommand";
import { StartExportTaskCommandInput, StartExportTaskCommandOutput } from "../commands/StartExportTaskCommand";
import { StopActivityStreamCommandInput, StopActivityStreamCommandOutput } from "../commands/StopActivityStreamCommand";
import { StopDBClusterCommandInput, StopDBClusterCommandOutput } from "../commands/StopDBClusterCommand";
import { StopDBInstanceAutomatedBackupsReplicationCommandInput, StopDBInstanceAutomatedBackupsReplicationCommandOutput } from "../commands/StopDBInstanceAutomatedBackupsReplicationCommand";
import { StopDBInstanceCommandInput, StopDBInstanceCommandOutput } from "../commands/StopDBInstanceCommand";
import { SwitchoverBlueGreenDeploymentCommandInput, SwitchoverBlueGreenDeploymentCommandOutput } from "../commands/SwitchoverBlueGreenDeploymentCommand";
import { SwitchoverGlobalClusterCommandInput, SwitchoverGlobalClusterCommandOutput } from "../commands/SwitchoverGlobalClusterCommand";
import { SwitchoverReadReplicaCommandInput, SwitchoverReadReplicaCommandOutput } from "../commands/SwitchoverReadReplicaCommand";
/**
 * serializeAws_queryAddRoleToDBClusterCommand
 */
export declare const se_AddRoleToDBClusterCommand: (input: AddRoleToDBClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryAddRoleToDBInstanceCommand
 */
export declare const se_AddRoleToDBInstanceCommand: (input: AddRoleToDBInstanceCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryAddSourceIdentifierToSubscriptionCommand
 */
export declare const se_AddSourceIdentifierToSubscriptionCommand: (input: AddSourceIdentifierToSubscriptionCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryAddTagsToResourceCommand
 */
export declare const se_AddTagsToResourceCommand: (input: AddTagsToResourceCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryApplyPendingMaintenanceActionCommand
 */
export declare const se_ApplyPendingMaintenanceActionCommand: (input: ApplyPendingMaintenanceActionCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryAuthorizeDBSecurityGroupIngressCommand
 */
export declare const se_AuthorizeDBSecurityGroupIngressCommand: (input: AuthorizeDBSecurityGroupIngressCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryBacktrackDBClusterCommand
 */
export declare const se_BacktrackDBClusterCommand: (input: BacktrackDBClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCancelExportTaskCommand
 */
export declare const se_CancelExportTaskCommand: (input: CancelExportTaskCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCopyDBClusterParameterGroupCommand
 */
export declare const se_CopyDBClusterParameterGroupCommand: (input: CopyDBClusterParameterGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCopyDBClusterSnapshotCommand
 */
export declare const se_CopyDBClusterSnapshotCommand: (input: CopyDBClusterSnapshotCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCopyDBParameterGroupCommand
 */
export declare const se_CopyDBParameterGroupCommand: (input: CopyDBParameterGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCopyDBSnapshotCommand
 */
export declare const se_CopyDBSnapshotCommand: (input: CopyDBSnapshotCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCopyOptionGroupCommand
 */
export declare const se_CopyOptionGroupCommand: (input: CopyOptionGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateBlueGreenDeploymentCommand
 */
export declare const se_CreateBlueGreenDeploymentCommand: (input: CreateBlueGreenDeploymentCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateCustomDBEngineVersionCommand
 */
export declare const se_CreateCustomDBEngineVersionCommand: (input: CreateCustomDBEngineVersionCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateDBClusterCommand
 */
export declare const se_CreateDBClusterCommand: (input: CreateDBClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateDBClusterEndpointCommand
 */
export declare const se_CreateDBClusterEndpointCommand: (input: CreateDBClusterEndpointCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateDBClusterParameterGroupCommand
 */
export declare const se_CreateDBClusterParameterGroupCommand: (input: CreateDBClusterParameterGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateDBClusterSnapshotCommand
 */
export declare const se_CreateDBClusterSnapshotCommand: (input: CreateDBClusterSnapshotCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateDBInstanceCommand
 */
export declare const se_CreateDBInstanceCommand: (input: CreateDBInstanceCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateDBInstanceReadReplicaCommand
 */
export declare const se_CreateDBInstanceReadReplicaCommand: (input: CreateDBInstanceReadReplicaCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateDBParameterGroupCommand
 */
export declare const se_CreateDBParameterGroupCommand: (input: CreateDBParameterGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateDBProxyCommand
 */
export declare const se_CreateDBProxyCommand: (input: CreateDBProxyCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateDBProxyEndpointCommand
 */
export declare const se_CreateDBProxyEndpointCommand: (input: CreateDBProxyEndpointCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateDBSecurityGroupCommand
 */
export declare const se_CreateDBSecurityGroupCommand: (input: CreateDBSecurityGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateDBShardGroupCommand
 */
export declare const se_CreateDBShardGroupCommand: (input: CreateDBShardGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateDBSnapshotCommand
 */
export declare const se_CreateDBSnapshotCommand: (input: CreateDBSnapshotCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateDBSubnetGroupCommand
 */
export declare const se_CreateDBSubnetGroupCommand: (input: CreateDBSubnetGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateEventSubscriptionCommand
 */
export declare const se_CreateEventSubscriptionCommand: (input: CreateEventSubscriptionCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateGlobalClusterCommand
 */
export declare const se_CreateGlobalClusterCommand: (input: CreateGlobalClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateIntegrationCommand
 */
export declare const se_CreateIntegrationCommand: (input: CreateIntegrationCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateOptionGroupCommand
 */
export declare const se_CreateOptionGroupCommand: (input: CreateOptionGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryCreateTenantDatabaseCommand
 */
export declare const se_CreateTenantDatabaseCommand: (input: CreateTenantDatabaseCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteBlueGreenDeploymentCommand
 */
export declare const se_DeleteBlueGreenDeploymentCommand: (input: DeleteBlueGreenDeploymentCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteCustomDBEngineVersionCommand
 */
export declare const se_DeleteCustomDBEngineVersionCommand: (input: DeleteCustomDBEngineVersionCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteDBClusterCommand
 */
export declare const se_DeleteDBClusterCommand: (input: DeleteDBClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteDBClusterAutomatedBackupCommand
 */
export declare const se_DeleteDBClusterAutomatedBackupCommand: (input: DeleteDBClusterAutomatedBackupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteDBClusterEndpointCommand
 */
export declare const se_DeleteDBClusterEndpointCommand: (input: DeleteDBClusterEndpointCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteDBClusterParameterGroupCommand
 */
export declare const se_DeleteDBClusterParameterGroupCommand: (input: DeleteDBClusterParameterGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteDBClusterSnapshotCommand
 */
export declare const se_DeleteDBClusterSnapshotCommand: (input: DeleteDBClusterSnapshotCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteDBInstanceCommand
 */
export declare const se_DeleteDBInstanceCommand: (input: DeleteDBInstanceCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteDBInstanceAutomatedBackupCommand
 */
export declare const se_DeleteDBInstanceAutomatedBackupCommand: (input: DeleteDBInstanceAutomatedBackupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteDBParameterGroupCommand
 */
export declare const se_DeleteDBParameterGroupCommand: (input: DeleteDBParameterGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteDBProxyCommand
 */
export declare const se_DeleteDBProxyCommand: (input: DeleteDBProxyCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteDBProxyEndpointCommand
 */
export declare const se_DeleteDBProxyEndpointCommand: (input: DeleteDBProxyEndpointCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteDBSecurityGroupCommand
 */
export declare const se_DeleteDBSecurityGroupCommand: (input: DeleteDBSecurityGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteDBShardGroupCommand
 */
export declare const se_DeleteDBShardGroupCommand: (input: DeleteDBShardGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteDBSnapshotCommand
 */
export declare const se_DeleteDBSnapshotCommand: (input: DeleteDBSnapshotCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteDBSubnetGroupCommand
 */
export declare const se_DeleteDBSubnetGroupCommand: (input: DeleteDBSubnetGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteEventSubscriptionCommand
 */
export declare const se_DeleteEventSubscriptionCommand: (input: DeleteEventSubscriptionCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteGlobalClusterCommand
 */
export declare const se_DeleteGlobalClusterCommand: (input: DeleteGlobalClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteIntegrationCommand
 */
export declare const se_DeleteIntegrationCommand: (input: DeleteIntegrationCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteOptionGroupCommand
 */
export declare const se_DeleteOptionGroupCommand: (input: DeleteOptionGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeleteTenantDatabaseCommand
 */
export declare const se_DeleteTenantDatabaseCommand: (input: DeleteTenantDatabaseCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDeregisterDBProxyTargetsCommand
 */
export declare const se_DeregisterDBProxyTargetsCommand: (input: DeregisterDBProxyTargetsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeAccountAttributesCommand
 */
export declare const se_DescribeAccountAttributesCommand: (input: DescribeAccountAttributesCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeBlueGreenDeploymentsCommand
 */
export declare const se_DescribeBlueGreenDeploymentsCommand: (input: DescribeBlueGreenDeploymentsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeCertificatesCommand
 */
export declare const se_DescribeCertificatesCommand: (input: DescribeCertificatesCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBClusterAutomatedBackupsCommand
 */
export declare const se_DescribeDBClusterAutomatedBackupsCommand: (input: DescribeDBClusterAutomatedBackupsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBClusterBacktracksCommand
 */
export declare const se_DescribeDBClusterBacktracksCommand: (input: DescribeDBClusterBacktracksCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBClusterEndpointsCommand
 */
export declare const se_DescribeDBClusterEndpointsCommand: (input: DescribeDBClusterEndpointsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBClusterParameterGroupsCommand
 */
export declare const se_DescribeDBClusterParameterGroupsCommand: (input: DescribeDBClusterParameterGroupsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBClusterParametersCommand
 */
export declare const se_DescribeDBClusterParametersCommand: (input: DescribeDBClusterParametersCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBClustersCommand
 */
export declare const se_DescribeDBClustersCommand: (input: DescribeDBClustersCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBClusterSnapshotAttributesCommand
 */
export declare const se_DescribeDBClusterSnapshotAttributesCommand: (input: DescribeDBClusterSnapshotAttributesCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBClusterSnapshotsCommand
 */
export declare const se_DescribeDBClusterSnapshotsCommand: (input: DescribeDBClusterSnapshotsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBEngineVersionsCommand
 */
export declare const se_DescribeDBEngineVersionsCommand: (input: DescribeDBEngineVersionsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBInstanceAutomatedBackupsCommand
 */
export declare const se_DescribeDBInstanceAutomatedBackupsCommand: (input: DescribeDBInstanceAutomatedBackupsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBInstancesCommand
 */
export declare const se_DescribeDBInstancesCommand: (input: DescribeDBInstancesCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBLogFilesCommand
 */
export declare const se_DescribeDBLogFilesCommand: (input: DescribeDBLogFilesCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBParameterGroupsCommand
 */
export declare const se_DescribeDBParameterGroupsCommand: (input: DescribeDBParameterGroupsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBParametersCommand
 */
export declare const se_DescribeDBParametersCommand: (input: DescribeDBParametersCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBProxiesCommand
 */
export declare const se_DescribeDBProxiesCommand: (input: DescribeDBProxiesCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBProxyEndpointsCommand
 */
export declare const se_DescribeDBProxyEndpointsCommand: (input: DescribeDBProxyEndpointsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBProxyTargetGroupsCommand
 */
export declare const se_DescribeDBProxyTargetGroupsCommand: (input: DescribeDBProxyTargetGroupsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBProxyTargetsCommand
 */
export declare const se_DescribeDBProxyTargetsCommand: (input: DescribeDBProxyTargetsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBRecommendationsCommand
 */
export declare const se_DescribeDBRecommendationsCommand: (input: DescribeDBRecommendationsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBSecurityGroupsCommand
 */
export declare const se_DescribeDBSecurityGroupsCommand: (input: DescribeDBSecurityGroupsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBShardGroupsCommand
 */
export declare const se_DescribeDBShardGroupsCommand: (input: DescribeDBShardGroupsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBSnapshotAttributesCommand
 */
export declare const se_DescribeDBSnapshotAttributesCommand: (input: DescribeDBSnapshotAttributesCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBSnapshotsCommand
 */
export declare const se_DescribeDBSnapshotsCommand: (input: DescribeDBSnapshotsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBSnapshotTenantDatabasesCommand
 */
export declare const se_DescribeDBSnapshotTenantDatabasesCommand: (input: DescribeDBSnapshotTenantDatabasesCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeDBSubnetGroupsCommand
 */
export declare const se_DescribeDBSubnetGroupsCommand: (input: DescribeDBSubnetGroupsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeEngineDefaultClusterParametersCommand
 */
export declare const se_DescribeEngineDefaultClusterParametersCommand: (input: DescribeEngineDefaultClusterParametersCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeEngineDefaultParametersCommand
 */
export declare const se_DescribeEngineDefaultParametersCommand: (input: DescribeEngineDefaultParametersCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeEventCategoriesCommand
 */
export declare const se_DescribeEventCategoriesCommand: (input: DescribeEventCategoriesCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeEventsCommand
 */
export declare const se_DescribeEventsCommand: (input: DescribeEventsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeEventSubscriptionsCommand
 */
export declare const se_DescribeEventSubscriptionsCommand: (input: DescribeEventSubscriptionsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeExportTasksCommand
 */
export declare const se_DescribeExportTasksCommand: (input: DescribeExportTasksCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeGlobalClustersCommand
 */
export declare const se_DescribeGlobalClustersCommand: (input: DescribeGlobalClustersCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeIntegrationsCommand
 */
export declare const se_DescribeIntegrationsCommand: (input: DescribeIntegrationsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeOptionGroupOptionsCommand
 */
export declare const se_DescribeOptionGroupOptionsCommand: (input: DescribeOptionGroupOptionsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeOptionGroupsCommand
 */
export declare const se_DescribeOptionGroupsCommand: (input: DescribeOptionGroupsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeOrderableDBInstanceOptionsCommand
 */
export declare const se_DescribeOrderableDBInstanceOptionsCommand: (input: DescribeOrderableDBInstanceOptionsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribePendingMaintenanceActionsCommand
 */
export declare const se_DescribePendingMaintenanceActionsCommand: (input: DescribePendingMaintenanceActionsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeReservedDBInstancesCommand
 */
export declare const se_DescribeReservedDBInstancesCommand: (input: DescribeReservedDBInstancesCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeReservedDBInstancesOfferingsCommand
 */
export declare const se_DescribeReservedDBInstancesOfferingsCommand: (input: DescribeReservedDBInstancesOfferingsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeSourceRegionsCommand
 */
export declare const se_DescribeSourceRegionsCommand: (input: DescribeSourceRegionsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeTenantDatabasesCommand
 */
export declare const se_DescribeTenantDatabasesCommand: (input: DescribeTenantDatabasesCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDescribeValidDBInstanceModificationsCommand
 */
export declare const se_DescribeValidDBInstanceModificationsCommand: (input: DescribeValidDBInstanceModificationsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDisableHttpEndpointCommand
 */
export declare const se_DisableHttpEndpointCommand: (input: DisableHttpEndpointCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryDownloadDBLogFilePortionCommand
 */
export declare const se_DownloadDBLogFilePortionCommand: (input: DownloadDBLogFilePortionCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryEnableHttpEndpointCommand
 */
export declare const se_EnableHttpEndpointCommand: (input: EnableHttpEndpointCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryFailoverDBClusterCommand
 */
export declare const se_FailoverDBClusterCommand: (input: FailoverDBClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryFailoverGlobalClusterCommand
 */
export declare const se_FailoverGlobalClusterCommand: (input: FailoverGlobalClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryListTagsForResourceCommand
 */
export declare const se_ListTagsForResourceCommand: (input: ListTagsForResourceCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyActivityStreamCommand
 */
export declare const se_ModifyActivityStreamCommand: (input: ModifyActivityStreamCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyCertificatesCommand
 */
export declare const se_ModifyCertificatesCommand: (input: ModifyCertificatesCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyCurrentDBClusterCapacityCommand
 */
export declare const se_ModifyCurrentDBClusterCapacityCommand: (input: ModifyCurrentDBClusterCapacityCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyCustomDBEngineVersionCommand
 */
export declare const se_ModifyCustomDBEngineVersionCommand: (input: ModifyCustomDBEngineVersionCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyDBClusterCommand
 */
export declare const se_ModifyDBClusterCommand: (input: ModifyDBClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyDBClusterEndpointCommand
 */
export declare const se_ModifyDBClusterEndpointCommand: (input: ModifyDBClusterEndpointCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyDBClusterParameterGroupCommand
 */
export declare const se_ModifyDBClusterParameterGroupCommand: (input: ModifyDBClusterParameterGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyDBClusterSnapshotAttributeCommand
 */
export declare const se_ModifyDBClusterSnapshotAttributeCommand: (input: ModifyDBClusterSnapshotAttributeCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyDBInstanceCommand
 */
export declare const se_ModifyDBInstanceCommand: (input: ModifyDBInstanceCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyDBParameterGroupCommand
 */
export declare const se_ModifyDBParameterGroupCommand: (input: ModifyDBParameterGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyDBProxyCommand
 */
export declare const se_ModifyDBProxyCommand: (input: ModifyDBProxyCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyDBProxyEndpointCommand
 */
export declare const se_ModifyDBProxyEndpointCommand: (input: ModifyDBProxyEndpointCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyDBProxyTargetGroupCommand
 */
export declare const se_ModifyDBProxyTargetGroupCommand: (input: ModifyDBProxyTargetGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyDBRecommendationCommand
 */
export declare const se_ModifyDBRecommendationCommand: (input: ModifyDBRecommendationCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyDBShardGroupCommand
 */
export declare const se_ModifyDBShardGroupCommand: (input: ModifyDBShardGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyDBSnapshotCommand
 */
export declare const se_ModifyDBSnapshotCommand: (input: ModifyDBSnapshotCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyDBSnapshotAttributeCommand
 */
export declare const se_ModifyDBSnapshotAttributeCommand: (input: ModifyDBSnapshotAttributeCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyDBSubnetGroupCommand
 */
export declare const se_ModifyDBSubnetGroupCommand: (input: ModifyDBSubnetGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyEventSubscriptionCommand
 */
export declare const se_ModifyEventSubscriptionCommand: (input: ModifyEventSubscriptionCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyGlobalClusterCommand
 */
export declare const se_ModifyGlobalClusterCommand: (input: ModifyGlobalClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyIntegrationCommand
 */
export declare const se_ModifyIntegrationCommand: (input: ModifyIntegrationCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyOptionGroupCommand
 */
export declare const se_ModifyOptionGroupCommand: (input: ModifyOptionGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryModifyTenantDatabaseCommand
 */
export declare const se_ModifyTenantDatabaseCommand: (input: ModifyTenantDatabaseCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryPromoteReadReplicaCommand
 */
export declare const se_PromoteReadReplicaCommand: (input: PromoteReadReplicaCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryPromoteReadReplicaDBClusterCommand
 */
export declare const se_PromoteReadReplicaDBClusterCommand: (input: PromoteReadReplicaDBClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryPurchaseReservedDBInstancesOfferingCommand
 */
export declare const se_PurchaseReservedDBInstancesOfferingCommand: (input: PurchaseReservedDBInstancesOfferingCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRebootDBClusterCommand
 */
export declare const se_RebootDBClusterCommand: (input: RebootDBClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRebootDBInstanceCommand
 */
export declare const se_RebootDBInstanceCommand: (input: RebootDBInstanceCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRebootDBShardGroupCommand
 */
export declare const se_RebootDBShardGroupCommand: (input: RebootDBShardGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRegisterDBProxyTargetsCommand
 */
export declare const se_RegisterDBProxyTargetsCommand: (input: RegisterDBProxyTargetsCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRemoveFromGlobalClusterCommand
 */
export declare const se_RemoveFromGlobalClusterCommand: (input: RemoveFromGlobalClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRemoveRoleFromDBClusterCommand
 */
export declare const se_RemoveRoleFromDBClusterCommand: (input: RemoveRoleFromDBClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRemoveRoleFromDBInstanceCommand
 */
export declare const se_RemoveRoleFromDBInstanceCommand: (input: RemoveRoleFromDBInstanceCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRemoveSourceIdentifierFromSubscriptionCommand
 */
export declare const se_RemoveSourceIdentifierFromSubscriptionCommand: (input: RemoveSourceIdentifierFromSubscriptionCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRemoveTagsFromResourceCommand
 */
export declare const se_RemoveTagsFromResourceCommand: (input: RemoveTagsFromResourceCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryResetDBClusterParameterGroupCommand
 */
export declare const se_ResetDBClusterParameterGroupCommand: (input: ResetDBClusterParameterGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryResetDBParameterGroupCommand
 */
export declare const se_ResetDBParameterGroupCommand: (input: ResetDBParameterGroupCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRestoreDBClusterFromS3Command
 */
export declare const se_RestoreDBClusterFromS3Command: (input: RestoreDBClusterFromS3CommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRestoreDBClusterFromSnapshotCommand
 */
export declare const se_RestoreDBClusterFromSnapshotCommand: (input: RestoreDBClusterFromSnapshotCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRestoreDBClusterToPointInTimeCommand
 */
export declare const se_RestoreDBClusterToPointInTimeCommand: (input: RestoreDBClusterToPointInTimeCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRestoreDBInstanceFromDBSnapshotCommand
 */
export declare const se_RestoreDBInstanceFromDBSnapshotCommand: (input: RestoreDBInstanceFromDBSnapshotCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRestoreDBInstanceFromS3Command
 */
export declare const se_RestoreDBInstanceFromS3Command: (input: RestoreDBInstanceFromS3CommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRestoreDBInstanceToPointInTimeCommand
 */
export declare const se_RestoreDBInstanceToPointInTimeCommand: (input: RestoreDBInstanceToPointInTimeCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryRevokeDBSecurityGroupIngressCommand
 */
export declare const se_RevokeDBSecurityGroupIngressCommand: (input: RevokeDBSecurityGroupIngressCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryStartActivityStreamCommand
 */
export declare const se_StartActivityStreamCommand: (input: StartActivityStreamCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryStartDBClusterCommand
 */
export declare const se_StartDBClusterCommand: (input: StartDBClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryStartDBInstanceCommand
 */
export declare const se_StartDBInstanceCommand: (input: StartDBInstanceCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryStartDBInstanceAutomatedBackupsReplicationCommand
 */
export declare const se_StartDBInstanceAutomatedBackupsReplicationCommand: (input: StartDBInstanceAutomatedBackupsReplicationCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryStartExportTaskCommand
 */
export declare const se_StartExportTaskCommand: (input: StartExportTaskCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryStopActivityStreamCommand
 */
export declare const se_StopActivityStreamCommand: (input: StopActivityStreamCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryStopDBClusterCommand
 */
export declare const se_StopDBClusterCommand: (input: StopDBClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryStopDBInstanceCommand
 */
export declare const se_StopDBInstanceCommand: (input: StopDBInstanceCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_queryStopDBInstanceAutomatedBackupsReplicationCommand
 */
export declare const se_StopDBInstanceAutomatedBackupsReplicationCommand: (input: StopDBInstanceAutomatedBackupsReplicationCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_querySwitchoverBlueGreenDeploymentCommand
 */
export declare const se_SwitchoverBlueGreenDeploymentCommand: (input: SwitchoverBlueGreenDeploymentCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_querySwitchoverGlobalClusterCommand
 */
export declare const se_SwitchoverGlobalClusterCommand: (input: SwitchoverGlobalClusterCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * serializeAws_querySwitchoverReadReplicaCommand
 */
export declare const se_SwitchoverReadReplicaCommand: (input: SwitchoverReadReplicaCommandInput, context: __SerdeContext) => Promise<__HttpRequest>;
/**
 * deserializeAws_queryAddRoleToDBClusterCommand
 */
export declare const de_AddRoleToDBClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<AddRoleToDBClusterCommandOutput>;
/**
 * deserializeAws_queryAddRoleToDBInstanceCommand
 */
export declare const de_AddRoleToDBInstanceCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<AddRoleToDBInstanceCommandOutput>;
/**
 * deserializeAws_queryAddSourceIdentifierToSubscriptionCommand
 */
export declare const de_AddSourceIdentifierToSubscriptionCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<AddSourceIdentifierToSubscriptionCommandOutput>;
/**
 * deserializeAws_queryAddTagsToResourceCommand
 */
export declare const de_AddTagsToResourceCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<AddTagsToResourceCommandOutput>;
/**
 * deserializeAws_queryApplyPendingMaintenanceActionCommand
 */
export declare const de_ApplyPendingMaintenanceActionCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ApplyPendingMaintenanceActionCommandOutput>;
/**
 * deserializeAws_queryAuthorizeDBSecurityGroupIngressCommand
 */
export declare const de_AuthorizeDBSecurityGroupIngressCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<AuthorizeDBSecurityGroupIngressCommandOutput>;
/**
 * deserializeAws_queryBacktrackDBClusterCommand
 */
export declare const de_BacktrackDBClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<BacktrackDBClusterCommandOutput>;
/**
 * deserializeAws_queryCancelExportTaskCommand
 */
export declare const de_CancelExportTaskCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CancelExportTaskCommandOutput>;
/**
 * deserializeAws_queryCopyDBClusterParameterGroupCommand
 */
export declare const de_CopyDBClusterParameterGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CopyDBClusterParameterGroupCommandOutput>;
/**
 * deserializeAws_queryCopyDBClusterSnapshotCommand
 */
export declare const de_CopyDBClusterSnapshotCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CopyDBClusterSnapshotCommandOutput>;
/**
 * deserializeAws_queryCopyDBParameterGroupCommand
 */
export declare const de_CopyDBParameterGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CopyDBParameterGroupCommandOutput>;
/**
 * deserializeAws_queryCopyDBSnapshotCommand
 */
export declare const de_CopyDBSnapshotCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CopyDBSnapshotCommandOutput>;
/**
 * deserializeAws_queryCopyOptionGroupCommand
 */
export declare const de_CopyOptionGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CopyOptionGroupCommandOutput>;
/**
 * deserializeAws_queryCreateBlueGreenDeploymentCommand
 */
export declare const de_CreateBlueGreenDeploymentCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateBlueGreenDeploymentCommandOutput>;
/**
 * deserializeAws_queryCreateCustomDBEngineVersionCommand
 */
export declare const de_CreateCustomDBEngineVersionCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateCustomDBEngineVersionCommandOutput>;
/**
 * deserializeAws_queryCreateDBClusterCommand
 */
export declare const de_CreateDBClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateDBClusterCommandOutput>;
/**
 * deserializeAws_queryCreateDBClusterEndpointCommand
 */
export declare const de_CreateDBClusterEndpointCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateDBClusterEndpointCommandOutput>;
/**
 * deserializeAws_queryCreateDBClusterParameterGroupCommand
 */
export declare const de_CreateDBClusterParameterGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateDBClusterParameterGroupCommandOutput>;
/**
 * deserializeAws_queryCreateDBClusterSnapshotCommand
 */
export declare const de_CreateDBClusterSnapshotCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateDBClusterSnapshotCommandOutput>;
/**
 * deserializeAws_queryCreateDBInstanceCommand
 */
export declare const de_CreateDBInstanceCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateDBInstanceCommandOutput>;
/**
 * deserializeAws_queryCreateDBInstanceReadReplicaCommand
 */
export declare const de_CreateDBInstanceReadReplicaCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateDBInstanceReadReplicaCommandOutput>;
/**
 * deserializeAws_queryCreateDBParameterGroupCommand
 */
export declare const de_CreateDBParameterGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateDBParameterGroupCommandOutput>;
/**
 * deserializeAws_queryCreateDBProxyCommand
 */
export declare const de_CreateDBProxyCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateDBProxyCommandOutput>;
/**
 * deserializeAws_queryCreateDBProxyEndpointCommand
 */
export declare const de_CreateDBProxyEndpointCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateDBProxyEndpointCommandOutput>;
/**
 * deserializeAws_queryCreateDBSecurityGroupCommand
 */
export declare const de_CreateDBSecurityGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateDBSecurityGroupCommandOutput>;
/**
 * deserializeAws_queryCreateDBShardGroupCommand
 */
export declare const de_CreateDBShardGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateDBShardGroupCommandOutput>;
/**
 * deserializeAws_queryCreateDBSnapshotCommand
 */
export declare const de_CreateDBSnapshotCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateDBSnapshotCommandOutput>;
/**
 * deserializeAws_queryCreateDBSubnetGroupCommand
 */
export declare const de_CreateDBSubnetGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateDBSubnetGroupCommandOutput>;
/**
 * deserializeAws_queryCreateEventSubscriptionCommand
 */
export declare const de_CreateEventSubscriptionCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateEventSubscriptionCommandOutput>;
/**
 * deserializeAws_queryCreateGlobalClusterCommand
 */
export declare const de_CreateGlobalClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateGlobalClusterCommandOutput>;
/**
 * deserializeAws_queryCreateIntegrationCommand
 */
export declare const de_CreateIntegrationCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateIntegrationCommandOutput>;
/**
 * deserializeAws_queryCreateOptionGroupCommand
 */
export declare const de_CreateOptionGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateOptionGroupCommandOutput>;
/**
 * deserializeAws_queryCreateTenantDatabaseCommand
 */
export declare const de_CreateTenantDatabaseCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<CreateTenantDatabaseCommandOutput>;
/**
 * deserializeAws_queryDeleteBlueGreenDeploymentCommand
 */
export declare const de_DeleteBlueGreenDeploymentCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteBlueGreenDeploymentCommandOutput>;
/**
 * deserializeAws_queryDeleteCustomDBEngineVersionCommand
 */
export declare const de_DeleteCustomDBEngineVersionCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteCustomDBEngineVersionCommandOutput>;
/**
 * deserializeAws_queryDeleteDBClusterCommand
 */
export declare const de_DeleteDBClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteDBClusterCommandOutput>;
/**
 * deserializeAws_queryDeleteDBClusterAutomatedBackupCommand
 */
export declare const de_DeleteDBClusterAutomatedBackupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteDBClusterAutomatedBackupCommandOutput>;
/**
 * deserializeAws_queryDeleteDBClusterEndpointCommand
 */
export declare const de_DeleteDBClusterEndpointCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteDBClusterEndpointCommandOutput>;
/**
 * deserializeAws_queryDeleteDBClusterParameterGroupCommand
 */
export declare const de_DeleteDBClusterParameterGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteDBClusterParameterGroupCommandOutput>;
/**
 * deserializeAws_queryDeleteDBClusterSnapshotCommand
 */
export declare const de_DeleteDBClusterSnapshotCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteDBClusterSnapshotCommandOutput>;
/**
 * deserializeAws_queryDeleteDBInstanceCommand
 */
export declare const de_DeleteDBInstanceCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteDBInstanceCommandOutput>;
/**
 * deserializeAws_queryDeleteDBInstanceAutomatedBackupCommand
 */
export declare const de_DeleteDBInstanceAutomatedBackupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteDBInstanceAutomatedBackupCommandOutput>;
/**
 * deserializeAws_queryDeleteDBParameterGroupCommand
 */
export declare const de_DeleteDBParameterGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteDBParameterGroupCommandOutput>;
/**
 * deserializeAws_queryDeleteDBProxyCommand
 */
export declare const de_DeleteDBProxyCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteDBProxyCommandOutput>;
/**
 * deserializeAws_queryDeleteDBProxyEndpointCommand
 */
export declare const de_DeleteDBProxyEndpointCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteDBProxyEndpointCommandOutput>;
/**
 * deserializeAws_queryDeleteDBSecurityGroupCommand
 */
export declare const de_DeleteDBSecurityGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteDBSecurityGroupCommandOutput>;
/**
 * deserializeAws_queryDeleteDBShardGroupCommand
 */
export declare const de_DeleteDBShardGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteDBShardGroupCommandOutput>;
/**
 * deserializeAws_queryDeleteDBSnapshotCommand
 */
export declare const de_DeleteDBSnapshotCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteDBSnapshotCommandOutput>;
/**
 * deserializeAws_queryDeleteDBSubnetGroupCommand
 */
export declare const de_DeleteDBSubnetGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteDBSubnetGroupCommandOutput>;
/**
 * deserializeAws_queryDeleteEventSubscriptionCommand
 */
export declare const de_DeleteEventSubscriptionCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteEventSubscriptionCommandOutput>;
/**
 * deserializeAws_queryDeleteGlobalClusterCommand
 */
export declare const de_DeleteGlobalClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteGlobalClusterCommandOutput>;
/**
 * deserializeAws_queryDeleteIntegrationCommand
 */
export declare const de_DeleteIntegrationCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteIntegrationCommandOutput>;
/**
 * deserializeAws_queryDeleteOptionGroupCommand
 */
export declare const de_DeleteOptionGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteOptionGroupCommandOutput>;
/**
 * deserializeAws_queryDeleteTenantDatabaseCommand
 */
export declare const de_DeleteTenantDatabaseCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeleteTenantDatabaseCommandOutput>;
/**
 * deserializeAws_queryDeregisterDBProxyTargetsCommand
 */
export declare const de_DeregisterDBProxyTargetsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DeregisterDBProxyTargetsCommandOutput>;
/**
 * deserializeAws_queryDescribeAccountAttributesCommand
 */
export declare const de_DescribeAccountAttributesCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeAccountAttributesCommandOutput>;
/**
 * deserializeAws_queryDescribeBlueGreenDeploymentsCommand
 */
export declare const de_DescribeBlueGreenDeploymentsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeBlueGreenDeploymentsCommandOutput>;
/**
 * deserializeAws_queryDescribeCertificatesCommand
 */
export declare const de_DescribeCertificatesCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeCertificatesCommandOutput>;
/**
 * deserializeAws_queryDescribeDBClusterAutomatedBackupsCommand
 */
export declare const de_DescribeDBClusterAutomatedBackupsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBClusterAutomatedBackupsCommandOutput>;
/**
 * deserializeAws_queryDescribeDBClusterBacktracksCommand
 */
export declare const de_DescribeDBClusterBacktracksCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBClusterBacktracksCommandOutput>;
/**
 * deserializeAws_queryDescribeDBClusterEndpointsCommand
 */
export declare const de_DescribeDBClusterEndpointsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBClusterEndpointsCommandOutput>;
/**
 * deserializeAws_queryDescribeDBClusterParameterGroupsCommand
 */
export declare const de_DescribeDBClusterParameterGroupsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBClusterParameterGroupsCommandOutput>;
/**
 * deserializeAws_queryDescribeDBClusterParametersCommand
 */
export declare const de_DescribeDBClusterParametersCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBClusterParametersCommandOutput>;
/**
 * deserializeAws_queryDescribeDBClustersCommand
 */
export declare const de_DescribeDBClustersCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBClustersCommandOutput>;
/**
 * deserializeAws_queryDescribeDBClusterSnapshotAttributesCommand
 */
export declare const de_DescribeDBClusterSnapshotAttributesCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBClusterSnapshotAttributesCommandOutput>;
/**
 * deserializeAws_queryDescribeDBClusterSnapshotsCommand
 */
export declare const de_DescribeDBClusterSnapshotsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBClusterSnapshotsCommandOutput>;
/**
 * deserializeAws_queryDescribeDBEngineVersionsCommand
 */
export declare const de_DescribeDBEngineVersionsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBEngineVersionsCommandOutput>;
/**
 * deserializeAws_queryDescribeDBInstanceAutomatedBackupsCommand
 */
export declare const de_DescribeDBInstanceAutomatedBackupsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBInstanceAutomatedBackupsCommandOutput>;
/**
 * deserializeAws_queryDescribeDBInstancesCommand
 */
export declare const de_DescribeDBInstancesCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBInstancesCommandOutput>;
/**
 * deserializeAws_queryDescribeDBLogFilesCommand
 */
export declare const de_DescribeDBLogFilesCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBLogFilesCommandOutput>;
/**
 * deserializeAws_queryDescribeDBParameterGroupsCommand
 */
export declare const de_DescribeDBParameterGroupsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBParameterGroupsCommandOutput>;
/**
 * deserializeAws_queryDescribeDBParametersCommand
 */
export declare const de_DescribeDBParametersCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBParametersCommandOutput>;
/**
 * deserializeAws_queryDescribeDBProxiesCommand
 */
export declare const de_DescribeDBProxiesCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBProxiesCommandOutput>;
/**
 * deserializeAws_queryDescribeDBProxyEndpointsCommand
 */
export declare const de_DescribeDBProxyEndpointsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBProxyEndpointsCommandOutput>;
/**
 * deserializeAws_queryDescribeDBProxyTargetGroupsCommand
 */
export declare const de_DescribeDBProxyTargetGroupsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBProxyTargetGroupsCommandOutput>;
/**
 * deserializeAws_queryDescribeDBProxyTargetsCommand
 */
export declare const de_DescribeDBProxyTargetsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBProxyTargetsCommandOutput>;
/**
 * deserializeAws_queryDescribeDBRecommendationsCommand
 */
export declare const de_DescribeDBRecommendationsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBRecommendationsCommandOutput>;
/**
 * deserializeAws_queryDescribeDBSecurityGroupsCommand
 */
export declare const de_DescribeDBSecurityGroupsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBSecurityGroupsCommandOutput>;
/**
 * deserializeAws_queryDescribeDBShardGroupsCommand
 */
export declare const de_DescribeDBShardGroupsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBShardGroupsCommandOutput>;
/**
 * deserializeAws_queryDescribeDBSnapshotAttributesCommand
 */
export declare const de_DescribeDBSnapshotAttributesCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBSnapshotAttributesCommandOutput>;
/**
 * deserializeAws_queryDescribeDBSnapshotsCommand
 */
export declare const de_DescribeDBSnapshotsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBSnapshotsCommandOutput>;
/**
 * deserializeAws_queryDescribeDBSnapshotTenantDatabasesCommand
 */
export declare const de_DescribeDBSnapshotTenantDatabasesCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBSnapshotTenantDatabasesCommandOutput>;
/**
 * deserializeAws_queryDescribeDBSubnetGroupsCommand
 */
export declare const de_DescribeDBSubnetGroupsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeDBSubnetGroupsCommandOutput>;
/**
 * deserializeAws_queryDescribeEngineDefaultClusterParametersCommand
 */
export declare const de_DescribeEngineDefaultClusterParametersCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeEngineDefaultClusterParametersCommandOutput>;
/**
 * deserializeAws_queryDescribeEngineDefaultParametersCommand
 */
export declare const de_DescribeEngineDefaultParametersCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeEngineDefaultParametersCommandOutput>;
/**
 * deserializeAws_queryDescribeEventCategoriesCommand
 */
export declare const de_DescribeEventCategoriesCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeEventCategoriesCommandOutput>;
/**
 * deserializeAws_queryDescribeEventsCommand
 */
export declare const de_DescribeEventsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeEventsCommandOutput>;
/**
 * deserializeAws_queryDescribeEventSubscriptionsCommand
 */
export declare const de_DescribeEventSubscriptionsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeEventSubscriptionsCommandOutput>;
/**
 * deserializeAws_queryDescribeExportTasksCommand
 */
export declare const de_DescribeExportTasksCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeExportTasksCommandOutput>;
/**
 * deserializeAws_queryDescribeGlobalClustersCommand
 */
export declare const de_DescribeGlobalClustersCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeGlobalClustersCommandOutput>;
/**
 * deserializeAws_queryDescribeIntegrationsCommand
 */
export declare const de_DescribeIntegrationsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeIntegrationsCommandOutput>;
/**
 * deserializeAws_queryDescribeOptionGroupOptionsCommand
 */
export declare const de_DescribeOptionGroupOptionsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeOptionGroupOptionsCommandOutput>;
/**
 * deserializeAws_queryDescribeOptionGroupsCommand
 */
export declare const de_DescribeOptionGroupsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeOptionGroupsCommandOutput>;
/**
 * deserializeAws_queryDescribeOrderableDBInstanceOptionsCommand
 */
export declare const de_DescribeOrderableDBInstanceOptionsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeOrderableDBInstanceOptionsCommandOutput>;
/**
 * deserializeAws_queryDescribePendingMaintenanceActionsCommand
 */
export declare const de_DescribePendingMaintenanceActionsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribePendingMaintenanceActionsCommandOutput>;
/**
 * deserializeAws_queryDescribeReservedDBInstancesCommand
 */
export declare const de_DescribeReservedDBInstancesCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeReservedDBInstancesCommandOutput>;
/**
 * deserializeAws_queryDescribeReservedDBInstancesOfferingsCommand
 */
export declare const de_DescribeReservedDBInstancesOfferingsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeReservedDBInstancesOfferingsCommandOutput>;
/**
 * deserializeAws_queryDescribeSourceRegionsCommand
 */
export declare const de_DescribeSourceRegionsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeSourceRegionsCommandOutput>;
/**
 * deserializeAws_queryDescribeTenantDatabasesCommand
 */
export declare const de_DescribeTenantDatabasesCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeTenantDatabasesCommandOutput>;
/**
 * deserializeAws_queryDescribeValidDBInstanceModificationsCommand
 */
export declare const de_DescribeValidDBInstanceModificationsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DescribeValidDBInstanceModificationsCommandOutput>;
/**
 * deserializeAws_queryDisableHttpEndpointCommand
 */
export declare const de_DisableHttpEndpointCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DisableHttpEndpointCommandOutput>;
/**
 * deserializeAws_queryDownloadDBLogFilePortionCommand
 */
export declare const de_DownloadDBLogFilePortionCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<DownloadDBLogFilePortionCommandOutput>;
/**
 * deserializeAws_queryEnableHttpEndpointCommand
 */
export declare const de_EnableHttpEndpointCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<EnableHttpEndpointCommandOutput>;
/**
 * deserializeAws_queryFailoverDBClusterCommand
 */
export declare const de_FailoverDBClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<FailoverDBClusterCommandOutput>;
/**
 * deserializeAws_queryFailoverGlobalClusterCommand
 */
export declare const de_FailoverGlobalClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<FailoverGlobalClusterCommandOutput>;
/**
 * deserializeAws_queryListTagsForResourceCommand
 */
export declare const de_ListTagsForResourceCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ListTagsForResourceCommandOutput>;
/**
 * deserializeAws_queryModifyActivityStreamCommand
 */
export declare const de_ModifyActivityStreamCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyActivityStreamCommandOutput>;
/**
 * deserializeAws_queryModifyCertificatesCommand
 */
export declare const de_ModifyCertificatesCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyCertificatesCommandOutput>;
/**
 * deserializeAws_queryModifyCurrentDBClusterCapacityCommand
 */
export declare const de_ModifyCurrentDBClusterCapacityCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyCurrentDBClusterCapacityCommandOutput>;
/**
 * deserializeAws_queryModifyCustomDBEngineVersionCommand
 */
export declare const de_ModifyCustomDBEngineVersionCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyCustomDBEngineVersionCommandOutput>;
/**
 * deserializeAws_queryModifyDBClusterCommand
 */
export declare const de_ModifyDBClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyDBClusterCommandOutput>;
/**
 * deserializeAws_queryModifyDBClusterEndpointCommand
 */
export declare const de_ModifyDBClusterEndpointCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyDBClusterEndpointCommandOutput>;
/**
 * deserializeAws_queryModifyDBClusterParameterGroupCommand
 */
export declare const de_ModifyDBClusterParameterGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyDBClusterParameterGroupCommandOutput>;
/**
 * deserializeAws_queryModifyDBClusterSnapshotAttributeCommand
 */
export declare const de_ModifyDBClusterSnapshotAttributeCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyDBClusterSnapshotAttributeCommandOutput>;
/**
 * deserializeAws_queryModifyDBInstanceCommand
 */
export declare const de_ModifyDBInstanceCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyDBInstanceCommandOutput>;
/**
 * deserializeAws_queryModifyDBParameterGroupCommand
 */
export declare const de_ModifyDBParameterGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyDBParameterGroupCommandOutput>;
/**
 * deserializeAws_queryModifyDBProxyCommand
 */
export declare const de_ModifyDBProxyCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyDBProxyCommandOutput>;
/**
 * deserializeAws_queryModifyDBProxyEndpointCommand
 */
export declare const de_ModifyDBProxyEndpointCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyDBProxyEndpointCommandOutput>;
/**
 * deserializeAws_queryModifyDBProxyTargetGroupCommand
 */
export declare const de_ModifyDBProxyTargetGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyDBProxyTargetGroupCommandOutput>;
/**
 * deserializeAws_queryModifyDBRecommendationCommand
 */
export declare const de_ModifyDBRecommendationCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyDBRecommendationCommandOutput>;
/**
 * deserializeAws_queryModifyDBShardGroupCommand
 */
export declare const de_ModifyDBShardGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyDBShardGroupCommandOutput>;
/**
 * deserializeAws_queryModifyDBSnapshotCommand
 */
export declare const de_ModifyDBSnapshotCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyDBSnapshotCommandOutput>;
/**
 * deserializeAws_queryModifyDBSnapshotAttributeCommand
 */
export declare const de_ModifyDBSnapshotAttributeCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyDBSnapshotAttributeCommandOutput>;
/**
 * deserializeAws_queryModifyDBSubnetGroupCommand
 */
export declare const de_ModifyDBSubnetGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyDBSubnetGroupCommandOutput>;
/**
 * deserializeAws_queryModifyEventSubscriptionCommand
 */
export declare const de_ModifyEventSubscriptionCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyEventSubscriptionCommandOutput>;
/**
 * deserializeAws_queryModifyGlobalClusterCommand
 */
export declare const de_ModifyGlobalClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyGlobalClusterCommandOutput>;
/**
 * deserializeAws_queryModifyIntegrationCommand
 */
export declare const de_ModifyIntegrationCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyIntegrationCommandOutput>;
/**
 * deserializeAws_queryModifyOptionGroupCommand
 */
export declare const de_ModifyOptionGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyOptionGroupCommandOutput>;
/**
 * deserializeAws_queryModifyTenantDatabaseCommand
 */
export declare const de_ModifyTenantDatabaseCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ModifyTenantDatabaseCommandOutput>;
/**
 * deserializeAws_queryPromoteReadReplicaCommand
 */
export declare const de_PromoteReadReplicaCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<PromoteReadReplicaCommandOutput>;
/**
 * deserializeAws_queryPromoteReadReplicaDBClusterCommand
 */
export declare const de_PromoteReadReplicaDBClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<PromoteReadReplicaDBClusterCommandOutput>;
/**
 * deserializeAws_queryPurchaseReservedDBInstancesOfferingCommand
 */
export declare const de_PurchaseReservedDBInstancesOfferingCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<PurchaseReservedDBInstancesOfferingCommandOutput>;
/**
 * deserializeAws_queryRebootDBClusterCommand
 */
export declare const de_RebootDBClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<RebootDBClusterCommandOutput>;
/**
 * deserializeAws_queryRebootDBInstanceCommand
 */
export declare const de_RebootDBInstanceCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<RebootDBInstanceCommandOutput>;
/**
 * deserializeAws_queryRebootDBShardGroupCommand
 */
export declare const de_RebootDBShardGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<RebootDBShardGroupCommandOutput>;
/**
 * deserializeAws_queryRegisterDBProxyTargetsCommand
 */
export declare const de_RegisterDBProxyTargetsCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<RegisterDBProxyTargetsCommandOutput>;
/**
 * deserializeAws_queryRemoveFromGlobalClusterCommand
 */
export declare const de_RemoveFromGlobalClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<RemoveFromGlobalClusterCommandOutput>;
/**
 * deserializeAws_queryRemoveRoleFromDBClusterCommand
 */
export declare const de_RemoveRoleFromDBClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<RemoveRoleFromDBClusterCommandOutput>;
/**
 * deserializeAws_queryRemoveRoleFromDBInstanceCommand
 */
export declare const de_RemoveRoleFromDBInstanceCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<RemoveRoleFromDBInstanceCommandOutput>;
/**
 * deserializeAws_queryRemoveSourceIdentifierFromSubscriptionCommand
 */
export declare const de_RemoveSourceIdentifierFromSubscriptionCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<RemoveSourceIdentifierFromSubscriptionCommandOutput>;
/**
 * deserializeAws_queryRemoveTagsFromResourceCommand
 */
export declare const de_RemoveTagsFromResourceCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<RemoveTagsFromResourceCommandOutput>;
/**
 * deserializeAws_queryResetDBClusterParameterGroupCommand
 */
export declare const de_ResetDBClusterParameterGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ResetDBClusterParameterGroupCommandOutput>;
/**
 * deserializeAws_queryResetDBParameterGroupCommand
 */
export declare const de_ResetDBParameterGroupCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<ResetDBParameterGroupCommandOutput>;
/**
 * deserializeAws_queryRestoreDBClusterFromS3Command
 */
export declare const de_RestoreDBClusterFromS3Command: (output: __HttpResponse, context: __SerdeContext) => Promise<RestoreDBClusterFromS3CommandOutput>;
/**
 * deserializeAws_queryRestoreDBClusterFromSnapshotCommand
 */
export declare const de_RestoreDBClusterFromSnapshotCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<RestoreDBClusterFromSnapshotCommandOutput>;
/**
 * deserializeAws_queryRestoreDBClusterToPointInTimeCommand
 */
export declare const de_RestoreDBClusterToPointInTimeCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<RestoreDBClusterToPointInTimeCommandOutput>;
/**
 * deserializeAws_queryRestoreDBInstanceFromDBSnapshotCommand
 */
export declare const de_RestoreDBInstanceFromDBSnapshotCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<RestoreDBInstanceFromDBSnapshotCommandOutput>;
/**
 * deserializeAws_queryRestoreDBInstanceFromS3Command
 */
export declare const de_RestoreDBInstanceFromS3Command: (output: __HttpResponse, context: __SerdeContext) => Promise<RestoreDBInstanceFromS3CommandOutput>;
/**
 * deserializeAws_queryRestoreDBInstanceToPointInTimeCommand
 */
export declare const de_RestoreDBInstanceToPointInTimeCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<RestoreDBInstanceToPointInTimeCommandOutput>;
/**
 * deserializeAws_queryRevokeDBSecurityGroupIngressCommand
 */
export declare const de_RevokeDBSecurityGroupIngressCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<RevokeDBSecurityGroupIngressCommandOutput>;
/**
 * deserializeAws_queryStartActivityStreamCommand
 */
export declare const de_StartActivityStreamCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<StartActivityStreamCommandOutput>;
/**
 * deserializeAws_queryStartDBClusterCommand
 */
export declare const de_StartDBClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<StartDBClusterCommandOutput>;
/**
 * deserializeAws_queryStartDBInstanceCommand
 */
export declare const de_StartDBInstanceCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<StartDBInstanceCommandOutput>;
/**
 * deserializeAws_queryStartDBInstanceAutomatedBackupsReplicationCommand
 */
export declare const de_StartDBInstanceAutomatedBackupsReplicationCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<StartDBInstanceAutomatedBackupsReplicationCommandOutput>;
/**
 * deserializeAws_queryStartExportTaskCommand
 */
export declare const de_StartExportTaskCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<StartExportTaskCommandOutput>;
/**
 * deserializeAws_queryStopActivityStreamCommand
 */
export declare const de_StopActivityStreamCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<StopActivityStreamCommandOutput>;
/**
 * deserializeAws_queryStopDBClusterCommand
 */
export declare const de_StopDBClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<StopDBClusterCommandOutput>;
/**
 * deserializeAws_queryStopDBInstanceCommand
 */
export declare const de_StopDBInstanceCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<StopDBInstanceCommandOutput>;
/**
 * deserializeAws_queryStopDBInstanceAutomatedBackupsReplicationCommand
 */
export declare const de_StopDBInstanceAutomatedBackupsReplicationCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<StopDBInstanceAutomatedBackupsReplicationCommandOutput>;
/**
 * deserializeAws_querySwitchoverBlueGreenDeploymentCommand
 */
export declare const de_SwitchoverBlueGreenDeploymentCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<SwitchoverBlueGreenDeploymentCommandOutput>;
/**
 * deserializeAws_querySwitchoverGlobalClusterCommand
 */
export declare const de_SwitchoverGlobalClusterCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<SwitchoverGlobalClusterCommandOutput>;
/**
 * deserializeAws_querySwitchoverReadReplicaCommand
 */
export declare const de_SwitchoverReadReplicaCommand: (output: __HttpResponse, context: __SerdeContext) => Promise<SwitchoverReadReplicaCommandOutput>;
