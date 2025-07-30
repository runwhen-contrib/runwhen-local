import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  StartDBInstanceAutomatedBackupsReplicationMessage,
  StartDBInstanceAutomatedBackupsReplicationResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface StartDBInstanceAutomatedBackupsReplicationCommandInput
  extends StartDBInstanceAutomatedBackupsReplicationMessage {}
export interface StartDBInstanceAutomatedBackupsReplicationCommandOutput
  extends StartDBInstanceAutomatedBackupsReplicationResult,
    __MetadataBearer {}
declare const StartDBInstanceAutomatedBackupsReplicationCommand_base: {
  new (
    input: StartDBInstanceAutomatedBackupsReplicationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StartDBInstanceAutomatedBackupsReplicationCommandInput,
    StartDBInstanceAutomatedBackupsReplicationCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: StartDBInstanceAutomatedBackupsReplicationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StartDBInstanceAutomatedBackupsReplicationCommandInput,
    StartDBInstanceAutomatedBackupsReplicationCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class StartDBInstanceAutomatedBackupsReplicationCommand extends StartDBInstanceAutomatedBackupsReplicationCommand_base {
  protected static __types: {
    api: {
      input: StartDBInstanceAutomatedBackupsReplicationMessage;
      output: StartDBInstanceAutomatedBackupsReplicationResult;
    };
    sdk: {
      input: StartDBInstanceAutomatedBackupsReplicationCommandInput;
      output: StartDBInstanceAutomatedBackupsReplicationCommandOutput;
    };
  };
}
