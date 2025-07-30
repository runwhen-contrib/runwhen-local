import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DeleteDBClusterAutomatedBackupMessage,
  DeleteDBClusterAutomatedBackupResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteDBClusterAutomatedBackupCommandInput
  extends DeleteDBClusterAutomatedBackupMessage {}
export interface DeleteDBClusterAutomatedBackupCommandOutput
  extends DeleteDBClusterAutomatedBackupResult,
    __MetadataBearer {}
declare const DeleteDBClusterAutomatedBackupCommand_base: {
  new (
    input: DeleteDBClusterAutomatedBackupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBClusterAutomatedBackupCommandInput,
    DeleteDBClusterAutomatedBackupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteDBClusterAutomatedBackupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBClusterAutomatedBackupCommandInput,
    DeleteDBClusterAutomatedBackupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteDBClusterAutomatedBackupCommand extends DeleteDBClusterAutomatedBackupCommand_base {
  protected static __types: {
    api: {
      input: DeleteDBClusterAutomatedBackupMessage;
      output: DeleteDBClusterAutomatedBackupResult;
    };
    sdk: {
      input: DeleteDBClusterAutomatedBackupCommandInput;
      output: DeleteDBClusterAutomatedBackupCommandOutput;
    };
  };
}
