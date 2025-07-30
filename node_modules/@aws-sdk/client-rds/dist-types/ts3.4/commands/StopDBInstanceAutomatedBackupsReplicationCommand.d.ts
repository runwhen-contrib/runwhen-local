import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  StopDBInstanceAutomatedBackupsReplicationMessage,
  StopDBInstanceAutomatedBackupsReplicationResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface StopDBInstanceAutomatedBackupsReplicationCommandInput
  extends StopDBInstanceAutomatedBackupsReplicationMessage {}
export interface StopDBInstanceAutomatedBackupsReplicationCommandOutput
  extends StopDBInstanceAutomatedBackupsReplicationResult,
    __MetadataBearer {}
declare const StopDBInstanceAutomatedBackupsReplicationCommand_base: {
  new (
    input: StopDBInstanceAutomatedBackupsReplicationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StopDBInstanceAutomatedBackupsReplicationCommandInput,
    StopDBInstanceAutomatedBackupsReplicationCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: StopDBInstanceAutomatedBackupsReplicationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StopDBInstanceAutomatedBackupsReplicationCommandInput,
    StopDBInstanceAutomatedBackupsReplicationCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class StopDBInstanceAutomatedBackupsReplicationCommand extends StopDBInstanceAutomatedBackupsReplicationCommand_base {
  protected static __types: {
    api: {
      input: StopDBInstanceAutomatedBackupsReplicationMessage;
      output: StopDBInstanceAutomatedBackupsReplicationResult;
    };
    sdk: {
      input: StopDBInstanceAutomatedBackupsReplicationCommandInput;
      output: StopDBInstanceAutomatedBackupsReplicationCommandOutput;
    };
  };
}
