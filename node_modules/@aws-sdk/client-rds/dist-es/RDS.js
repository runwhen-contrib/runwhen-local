import { createAggregatedClient } from "@smithy/smithy-client";
import { AddRoleToDBClusterCommand, } from "./commands/AddRoleToDBClusterCommand";
import { AddRoleToDBInstanceCommand, } from "./commands/AddRoleToDBInstanceCommand";
import { AddSourceIdentifierToSubscriptionCommand, } from "./commands/AddSourceIdentifierToSubscriptionCommand";
import { AddTagsToResourceCommand, } from "./commands/AddTagsToResourceCommand";
import { ApplyPendingMaintenanceActionCommand, } from "./commands/ApplyPendingMaintenanceActionCommand";
import { AuthorizeDBSecurityGroupIngressCommand, } from "./commands/AuthorizeDBSecurityGroupIngressCommand";
import { BacktrackDBClusterCommand, } from "./commands/BacktrackDBClusterCommand";
import { CancelExportTaskCommand, } from "./commands/CancelExportTaskCommand";
import { CopyDBClusterParameterGroupCommand, } from "./commands/CopyDBClusterParameterGroupCommand";
import { CopyDBClusterSnapshotCommand, } from "./commands/CopyDBClusterSnapshotCommand";
import { CopyDBParameterGroupCommand, } from "./commands/CopyDBParameterGroupCommand";
import { CopyDBSnapshotCommand, } from "./commands/CopyDBSnapshotCommand";
import { CopyOptionGroupCommand, } from "./commands/CopyOptionGroupCommand";
import { CreateBlueGreenDeploymentCommand, } from "./commands/CreateBlueGreenDeploymentCommand";
import { CreateCustomDBEngineVersionCommand, } from "./commands/CreateCustomDBEngineVersionCommand";
import { CreateDBClusterCommand, } from "./commands/CreateDBClusterCommand";
import { CreateDBClusterEndpointCommand, } from "./commands/CreateDBClusterEndpointCommand";
import { CreateDBClusterParameterGroupCommand, } from "./commands/CreateDBClusterParameterGroupCommand";
import { CreateDBClusterSnapshotCommand, } from "./commands/CreateDBClusterSnapshotCommand";
import { CreateDBInstanceCommand, } from "./commands/CreateDBInstanceCommand";
import { CreateDBInstanceReadReplicaCommand, } from "./commands/CreateDBInstanceReadReplicaCommand";
import { CreateDBParameterGroupCommand, } from "./commands/CreateDBParameterGroupCommand";
import { CreateDBProxyCommand, } from "./commands/CreateDBProxyCommand";
import { CreateDBProxyEndpointCommand, } from "./commands/CreateDBProxyEndpointCommand";
import { CreateDBSecurityGroupCommand, } from "./commands/CreateDBSecurityGroupCommand";
import { CreateDBShardGroupCommand, } from "./commands/CreateDBShardGroupCommand";
import { CreateDBSnapshotCommand, } from "./commands/CreateDBSnapshotCommand";
import { CreateDBSubnetGroupCommand, } from "./commands/CreateDBSubnetGroupCommand";
import { CreateEventSubscriptionCommand, } from "./commands/CreateEventSubscriptionCommand";
import { CreateGlobalClusterCommand, } from "./commands/CreateGlobalClusterCommand";
import { CreateIntegrationCommand, } from "./commands/CreateIntegrationCommand";
import { CreateOptionGroupCommand, } from "./commands/CreateOptionGroupCommand";
import { CreateTenantDatabaseCommand, } from "./commands/CreateTenantDatabaseCommand";
import { DeleteBlueGreenDeploymentCommand, } from "./commands/DeleteBlueGreenDeploymentCommand";
import { DeleteCustomDBEngineVersionCommand, } from "./commands/DeleteCustomDBEngineVersionCommand";
import { DeleteDBClusterAutomatedBackupCommand, } from "./commands/DeleteDBClusterAutomatedBackupCommand";
import { DeleteDBClusterCommand, } from "./commands/DeleteDBClusterCommand";
import { DeleteDBClusterEndpointCommand, } from "./commands/DeleteDBClusterEndpointCommand";
import { DeleteDBClusterParameterGroupCommand, } from "./commands/DeleteDBClusterParameterGroupCommand";
import { DeleteDBClusterSnapshotCommand, } from "./commands/DeleteDBClusterSnapshotCommand";
import { DeleteDBInstanceAutomatedBackupCommand, } from "./commands/DeleteDBInstanceAutomatedBackupCommand";
import { DeleteDBInstanceCommand, } from "./commands/DeleteDBInstanceCommand";
import { DeleteDBParameterGroupCommand, } from "./commands/DeleteDBParameterGroupCommand";
import { DeleteDBProxyCommand, } from "./commands/DeleteDBProxyCommand";
import { DeleteDBProxyEndpointCommand, } from "./commands/DeleteDBProxyEndpointCommand";
import { DeleteDBSecurityGroupCommand, } from "./commands/DeleteDBSecurityGroupCommand";
import { DeleteDBShardGroupCommand, } from "./commands/DeleteDBShardGroupCommand";
import { DeleteDBSnapshotCommand, } from "./commands/DeleteDBSnapshotCommand";
import { DeleteDBSubnetGroupCommand, } from "./commands/DeleteDBSubnetGroupCommand";
import { DeleteEventSubscriptionCommand, } from "./commands/DeleteEventSubscriptionCommand";
import { DeleteGlobalClusterCommand, } from "./commands/DeleteGlobalClusterCommand";
import { DeleteIntegrationCommand, } from "./commands/DeleteIntegrationCommand";
import { DeleteOptionGroupCommand, } from "./commands/DeleteOptionGroupCommand";
import { DeleteTenantDatabaseCommand, } from "./commands/DeleteTenantDatabaseCommand";
import { DeregisterDBProxyTargetsCommand, } from "./commands/DeregisterDBProxyTargetsCommand";
import { DescribeAccountAttributesCommand, } from "./commands/DescribeAccountAttributesCommand";
import { DescribeBlueGreenDeploymentsCommand, } from "./commands/DescribeBlueGreenDeploymentsCommand";
import { DescribeCertificatesCommand, } from "./commands/DescribeCertificatesCommand";
import { DescribeDBClusterAutomatedBackupsCommand, } from "./commands/DescribeDBClusterAutomatedBackupsCommand";
import { DescribeDBClusterBacktracksCommand, } from "./commands/DescribeDBClusterBacktracksCommand";
import { DescribeDBClusterEndpointsCommand, } from "./commands/DescribeDBClusterEndpointsCommand";
import { DescribeDBClusterParameterGroupsCommand, } from "./commands/DescribeDBClusterParameterGroupsCommand";
import { DescribeDBClusterParametersCommand, } from "./commands/DescribeDBClusterParametersCommand";
import { DescribeDBClustersCommand, } from "./commands/DescribeDBClustersCommand";
import { DescribeDBClusterSnapshotAttributesCommand, } from "./commands/DescribeDBClusterSnapshotAttributesCommand";
import { DescribeDBClusterSnapshotsCommand, } from "./commands/DescribeDBClusterSnapshotsCommand";
import { DescribeDBEngineVersionsCommand, } from "./commands/DescribeDBEngineVersionsCommand";
import { DescribeDBInstanceAutomatedBackupsCommand, } from "./commands/DescribeDBInstanceAutomatedBackupsCommand";
import { DescribeDBInstancesCommand, } from "./commands/DescribeDBInstancesCommand";
import { DescribeDBLogFilesCommand, } from "./commands/DescribeDBLogFilesCommand";
import { DescribeDBParameterGroupsCommand, } from "./commands/DescribeDBParameterGroupsCommand";
import { DescribeDBParametersCommand, } from "./commands/DescribeDBParametersCommand";
import { DescribeDBProxiesCommand, } from "./commands/DescribeDBProxiesCommand";
import { DescribeDBProxyEndpointsCommand, } from "./commands/DescribeDBProxyEndpointsCommand";
import { DescribeDBProxyTargetGroupsCommand, } from "./commands/DescribeDBProxyTargetGroupsCommand";
import { DescribeDBProxyTargetsCommand, } from "./commands/DescribeDBProxyTargetsCommand";
import { DescribeDBRecommendationsCommand, } from "./commands/DescribeDBRecommendationsCommand";
import { DescribeDBSecurityGroupsCommand, } from "./commands/DescribeDBSecurityGroupsCommand";
import { DescribeDBShardGroupsCommand, } from "./commands/DescribeDBShardGroupsCommand";
import { DescribeDBSnapshotAttributesCommand, } from "./commands/DescribeDBSnapshotAttributesCommand";
import { DescribeDBSnapshotsCommand, } from "./commands/DescribeDBSnapshotsCommand";
import { DescribeDBSnapshotTenantDatabasesCommand, } from "./commands/DescribeDBSnapshotTenantDatabasesCommand";
import { DescribeDBSubnetGroupsCommand, } from "./commands/DescribeDBSubnetGroupsCommand";
import { DescribeEngineDefaultClusterParametersCommand, } from "./commands/DescribeEngineDefaultClusterParametersCommand";
import { DescribeEngineDefaultParametersCommand, } from "./commands/DescribeEngineDefaultParametersCommand";
import { DescribeEventCategoriesCommand, } from "./commands/DescribeEventCategoriesCommand";
import { DescribeEventsCommand, } from "./commands/DescribeEventsCommand";
import { DescribeEventSubscriptionsCommand, } from "./commands/DescribeEventSubscriptionsCommand";
import { DescribeExportTasksCommand, } from "./commands/DescribeExportTasksCommand";
import { DescribeGlobalClustersCommand, } from "./commands/DescribeGlobalClustersCommand";
import { DescribeIntegrationsCommand, } from "./commands/DescribeIntegrationsCommand";
import { DescribeOptionGroupOptionsCommand, } from "./commands/DescribeOptionGroupOptionsCommand";
import { DescribeOptionGroupsCommand, } from "./commands/DescribeOptionGroupsCommand";
import { DescribeOrderableDBInstanceOptionsCommand, } from "./commands/DescribeOrderableDBInstanceOptionsCommand";
import { DescribePendingMaintenanceActionsCommand, } from "./commands/DescribePendingMaintenanceActionsCommand";
import { DescribeReservedDBInstancesCommand, } from "./commands/DescribeReservedDBInstancesCommand";
import { DescribeReservedDBInstancesOfferingsCommand, } from "./commands/DescribeReservedDBInstancesOfferingsCommand";
import { DescribeSourceRegionsCommand, } from "./commands/DescribeSourceRegionsCommand";
import { DescribeTenantDatabasesCommand, } from "./commands/DescribeTenantDatabasesCommand";
import { DescribeValidDBInstanceModificationsCommand, } from "./commands/DescribeValidDBInstanceModificationsCommand";
import { DisableHttpEndpointCommand, } from "./commands/DisableHttpEndpointCommand";
import { DownloadDBLogFilePortionCommand, } from "./commands/DownloadDBLogFilePortionCommand";
import { EnableHttpEndpointCommand, } from "./commands/EnableHttpEndpointCommand";
import { FailoverDBClusterCommand, } from "./commands/FailoverDBClusterCommand";
import { FailoverGlobalClusterCommand, } from "./commands/FailoverGlobalClusterCommand";
import { ListTagsForResourceCommand, } from "./commands/ListTagsForResourceCommand";
import { ModifyActivityStreamCommand, } from "./commands/ModifyActivityStreamCommand";
import { ModifyCertificatesCommand, } from "./commands/ModifyCertificatesCommand";
import { ModifyCurrentDBClusterCapacityCommand, } from "./commands/ModifyCurrentDBClusterCapacityCommand";
import { ModifyCustomDBEngineVersionCommand, } from "./commands/ModifyCustomDBEngineVersionCommand";
import { ModifyDBClusterCommand, } from "./commands/ModifyDBClusterCommand";
import { ModifyDBClusterEndpointCommand, } from "./commands/ModifyDBClusterEndpointCommand";
import { ModifyDBClusterParameterGroupCommand, } from "./commands/ModifyDBClusterParameterGroupCommand";
import { ModifyDBClusterSnapshotAttributeCommand, } from "./commands/ModifyDBClusterSnapshotAttributeCommand";
import { ModifyDBInstanceCommand, } from "./commands/ModifyDBInstanceCommand";
import { ModifyDBParameterGroupCommand, } from "./commands/ModifyDBParameterGroupCommand";
import { ModifyDBProxyCommand, } from "./commands/ModifyDBProxyCommand";
import { ModifyDBProxyEndpointCommand, } from "./commands/ModifyDBProxyEndpointCommand";
import { ModifyDBProxyTargetGroupCommand, } from "./commands/ModifyDBProxyTargetGroupCommand";
import { ModifyDBRecommendationCommand, } from "./commands/ModifyDBRecommendationCommand";
import { ModifyDBShardGroupCommand, } from "./commands/ModifyDBShardGroupCommand";
import { ModifyDBSnapshotAttributeCommand, } from "./commands/ModifyDBSnapshotAttributeCommand";
import { ModifyDBSnapshotCommand, } from "./commands/ModifyDBSnapshotCommand";
import { ModifyDBSubnetGroupCommand, } from "./commands/ModifyDBSubnetGroupCommand";
import { ModifyEventSubscriptionCommand, } from "./commands/ModifyEventSubscriptionCommand";
import { ModifyGlobalClusterCommand, } from "./commands/ModifyGlobalClusterCommand";
import { ModifyIntegrationCommand, } from "./commands/ModifyIntegrationCommand";
import { ModifyOptionGroupCommand, } from "./commands/ModifyOptionGroupCommand";
import { ModifyTenantDatabaseCommand, } from "./commands/ModifyTenantDatabaseCommand";
import { PromoteReadReplicaCommand, } from "./commands/PromoteReadReplicaCommand";
import { PromoteReadReplicaDBClusterCommand, } from "./commands/PromoteReadReplicaDBClusterCommand";
import { PurchaseReservedDBInstancesOfferingCommand, } from "./commands/PurchaseReservedDBInstancesOfferingCommand";
import { RebootDBClusterCommand, } from "./commands/RebootDBClusterCommand";
import { RebootDBInstanceCommand, } from "./commands/RebootDBInstanceCommand";
import { RebootDBShardGroupCommand, } from "./commands/RebootDBShardGroupCommand";
import { RegisterDBProxyTargetsCommand, } from "./commands/RegisterDBProxyTargetsCommand";
import { RemoveFromGlobalClusterCommand, } from "./commands/RemoveFromGlobalClusterCommand";
import { RemoveRoleFromDBClusterCommand, } from "./commands/RemoveRoleFromDBClusterCommand";
import { RemoveRoleFromDBInstanceCommand, } from "./commands/RemoveRoleFromDBInstanceCommand";
import { RemoveSourceIdentifierFromSubscriptionCommand, } from "./commands/RemoveSourceIdentifierFromSubscriptionCommand";
import { RemoveTagsFromResourceCommand, } from "./commands/RemoveTagsFromResourceCommand";
import { ResetDBClusterParameterGroupCommand, } from "./commands/ResetDBClusterParameterGroupCommand";
import { ResetDBParameterGroupCommand, } from "./commands/ResetDBParameterGroupCommand";
import { RestoreDBClusterFromS3Command, } from "./commands/RestoreDBClusterFromS3Command";
import { RestoreDBClusterFromSnapshotCommand, } from "./commands/RestoreDBClusterFromSnapshotCommand";
import { RestoreDBClusterToPointInTimeCommand, } from "./commands/RestoreDBClusterToPointInTimeCommand";
import { RestoreDBInstanceFromDBSnapshotCommand, } from "./commands/RestoreDBInstanceFromDBSnapshotCommand";
import { RestoreDBInstanceFromS3Command, } from "./commands/RestoreDBInstanceFromS3Command";
import { RestoreDBInstanceToPointInTimeCommand, } from "./commands/RestoreDBInstanceToPointInTimeCommand";
import { RevokeDBSecurityGroupIngressCommand, } from "./commands/RevokeDBSecurityGroupIngressCommand";
import { StartActivityStreamCommand, } from "./commands/StartActivityStreamCommand";
import { StartDBClusterCommand, } from "./commands/StartDBClusterCommand";
import { StartDBInstanceAutomatedBackupsReplicationCommand, } from "./commands/StartDBInstanceAutomatedBackupsReplicationCommand";
import { StartDBInstanceCommand, } from "./commands/StartDBInstanceCommand";
import { StartExportTaskCommand, } from "./commands/StartExportTaskCommand";
import { StopActivityStreamCommand, } from "./commands/StopActivityStreamCommand";
import { StopDBClusterCommand, } from "./commands/StopDBClusterCommand";
import { StopDBInstanceAutomatedBackupsReplicationCommand, } from "./commands/StopDBInstanceAutomatedBackupsReplicationCommand";
import { StopDBInstanceCommand, } from "./commands/StopDBInstanceCommand";
import { SwitchoverBlueGreenDeploymentCommand, } from "./commands/SwitchoverBlueGreenDeploymentCommand";
import { SwitchoverGlobalClusterCommand, } from "./commands/SwitchoverGlobalClusterCommand";
import { SwitchoverReadReplicaCommand, } from "./commands/SwitchoverReadReplicaCommand";
import { RDSClient } from "./RDSClient";
const commands = {
    AddRoleToDBClusterCommand,
    AddRoleToDBInstanceCommand,
    AddSourceIdentifierToSubscriptionCommand,
    AddTagsToResourceCommand,
    ApplyPendingMaintenanceActionCommand,
    AuthorizeDBSecurityGroupIngressCommand,
    BacktrackDBClusterCommand,
    CancelExportTaskCommand,
    CopyDBClusterParameterGroupCommand,
    CopyDBClusterSnapshotCommand,
    CopyDBParameterGroupCommand,
    CopyDBSnapshotCommand,
    CopyOptionGroupCommand,
    CreateBlueGreenDeploymentCommand,
    CreateCustomDBEngineVersionCommand,
    CreateDBClusterCommand,
    CreateDBClusterEndpointCommand,
    CreateDBClusterParameterGroupCommand,
    CreateDBClusterSnapshotCommand,
    CreateDBInstanceCommand,
    CreateDBInstanceReadReplicaCommand,
    CreateDBParameterGroupCommand,
    CreateDBProxyCommand,
    CreateDBProxyEndpointCommand,
    CreateDBSecurityGroupCommand,
    CreateDBShardGroupCommand,
    CreateDBSnapshotCommand,
    CreateDBSubnetGroupCommand,
    CreateEventSubscriptionCommand,
    CreateGlobalClusterCommand,
    CreateIntegrationCommand,
    CreateOptionGroupCommand,
    CreateTenantDatabaseCommand,
    DeleteBlueGreenDeploymentCommand,
    DeleteCustomDBEngineVersionCommand,
    DeleteDBClusterCommand,
    DeleteDBClusterAutomatedBackupCommand,
    DeleteDBClusterEndpointCommand,
    DeleteDBClusterParameterGroupCommand,
    DeleteDBClusterSnapshotCommand,
    DeleteDBInstanceCommand,
    DeleteDBInstanceAutomatedBackupCommand,
    DeleteDBParameterGroupCommand,
    DeleteDBProxyCommand,
    DeleteDBProxyEndpointCommand,
    DeleteDBSecurityGroupCommand,
    DeleteDBShardGroupCommand,
    DeleteDBSnapshotCommand,
    DeleteDBSubnetGroupCommand,
    DeleteEventSubscriptionCommand,
    DeleteGlobalClusterCommand,
    DeleteIntegrationCommand,
    DeleteOptionGroupCommand,
    DeleteTenantDatabaseCommand,
    DeregisterDBProxyTargetsCommand,
    DescribeAccountAttributesCommand,
    DescribeBlueGreenDeploymentsCommand,
    DescribeCertificatesCommand,
    DescribeDBClusterAutomatedBackupsCommand,
    DescribeDBClusterBacktracksCommand,
    DescribeDBClusterEndpointsCommand,
    DescribeDBClusterParameterGroupsCommand,
    DescribeDBClusterParametersCommand,
    DescribeDBClustersCommand,
    DescribeDBClusterSnapshotAttributesCommand,
    DescribeDBClusterSnapshotsCommand,
    DescribeDBEngineVersionsCommand,
    DescribeDBInstanceAutomatedBackupsCommand,
    DescribeDBInstancesCommand,
    DescribeDBLogFilesCommand,
    DescribeDBParameterGroupsCommand,
    DescribeDBParametersCommand,
    DescribeDBProxiesCommand,
    DescribeDBProxyEndpointsCommand,
    DescribeDBProxyTargetGroupsCommand,
    DescribeDBProxyTargetsCommand,
    DescribeDBRecommendationsCommand,
    DescribeDBSecurityGroupsCommand,
    DescribeDBShardGroupsCommand,
    DescribeDBSnapshotAttributesCommand,
    DescribeDBSnapshotsCommand,
    DescribeDBSnapshotTenantDatabasesCommand,
    DescribeDBSubnetGroupsCommand,
    DescribeEngineDefaultClusterParametersCommand,
    DescribeEngineDefaultParametersCommand,
    DescribeEventCategoriesCommand,
    DescribeEventsCommand,
    DescribeEventSubscriptionsCommand,
    DescribeExportTasksCommand,
    DescribeGlobalClustersCommand,
    DescribeIntegrationsCommand,
    DescribeOptionGroupOptionsCommand,
    DescribeOptionGroupsCommand,
    DescribeOrderableDBInstanceOptionsCommand,
    DescribePendingMaintenanceActionsCommand,
    DescribeReservedDBInstancesCommand,
    DescribeReservedDBInstancesOfferingsCommand,
    DescribeSourceRegionsCommand,
    DescribeTenantDatabasesCommand,
    DescribeValidDBInstanceModificationsCommand,
    DisableHttpEndpointCommand,
    DownloadDBLogFilePortionCommand,
    EnableHttpEndpointCommand,
    FailoverDBClusterCommand,
    FailoverGlobalClusterCommand,
    ListTagsForResourceCommand,
    ModifyActivityStreamCommand,
    ModifyCertificatesCommand,
    ModifyCurrentDBClusterCapacityCommand,
    ModifyCustomDBEngineVersionCommand,
    ModifyDBClusterCommand,
    ModifyDBClusterEndpointCommand,
    ModifyDBClusterParameterGroupCommand,
    ModifyDBClusterSnapshotAttributeCommand,
    ModifyDBInstanceCommand,
    ModifyDBParameterGroupCommand,
    ModifyDBProxyCommand,
    ModifyDBProxyEndpointCommand,
    ModifyDBProxyTargetGroupCommand,
    ModifyDBRecommendationCommand,
    ModifyDBShardGroupCommand,
    ModifyDBSnapshotCommand,
    ModifyDBSnapshotAttributeCommand,
    ModifyDBSubnetGroupCommand,
    ModifyEventSubscriptionCommand,
    ModifyGlobalClusterCommand,
    ModifyIntegrationCommand,
    ModifyOptionGroupCommand,
    ModifyTenantDatabaseCommand,
    PromoteReadReplicaCommand,
    PromoteReadReplicaDBClusterCommand,
    PurchaseReservedDBInstancesOfferingCommand,
    RebootDBClusterCommand,
    RebootDBInstanceCommand,
    RebootDBShardGroupCommand,
    RegisterDBProxyTargetsCommand,
    RemoveFromGlobalClusterCommand,
    RemoveRoleFromDBClusterCommand,
    RemoveRoleFromDBInstanceCommand,
    RemoveSourceIdentifierFromSubscriptionCommand,
    RemoveTagsFromResourceCommand,
    ResetDBClusterParameterGroupCommand,
    ResetDBParameterGroupCommand,
    RestoreDBClusterFromS3Command,
    RestoreDBClusterFromSnapshotCommand,
    RestoreDBClusterToPointInTimeCommand,
    RestoreDBInstanceFromDBSnapshotCommand,
    RestoreDBInstanceFromS3Command,
    RestoreDBInstanceToPointInTimeCommand,
    RevokeDBSecurityGroupIngressCommand,
    StartActivityStreamCommand,
    StartDBClusterCommand,
    StartDBInstanceCommand,
    StartDBInstanceAutomatedBackupsReplicationCommand,
    StartExportTaskCommand,
    StopActivityStreamCommand,
    StopDBClusterCommand,
    StopDBInstanceCommand,
    StopDBInstanceAutomatedBackupsReplicationCommand,
    SwitchoverBlueGreenDeploymentCommand,
    SwitchoverGlobalClusterCommand,
    SwitchoverReadReplicaCommand,
};
export class RDS extends RDSClient {
}
createAggregatedClient(commands, RDS);
