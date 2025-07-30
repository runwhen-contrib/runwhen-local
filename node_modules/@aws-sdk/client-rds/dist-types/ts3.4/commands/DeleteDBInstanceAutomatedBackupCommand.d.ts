import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DeleteDBInstanceAutomatedBackupMessage,
  DeleteDBInstanceAutomatedBackupResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteDBInstanceAutomatedBackupCommandInput
  extends DeleteDBInstanceAutomatedBackupMessage {}
export interface DeleteDBInstanceAutomatedBackupCommandOutput
  extends DeleteDBInstanceAutomatedBackupResult,
    __MetadataBearer {}
declare const DeleteDBInstanceAutomatedBackupCommand_base: {
  new (
    input: DeleteDBInstanceAutomatedBackupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBInstanceAutomatedBackupCommandInput,
    DeleteDBInstanceAutomatedBackupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DeleteDBInstanceAutomatedBackupCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBInstanceAutomatedBackupCommandInput,
    DeleteDBInstanceAutomatedBackupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteDBInstanceAutomatedBackupCommand extends DeleteDBInstanceAutomatedBackupCommand_base {
  protected static __types: {
    api: {
      input: DeleteDBInstanceAutomatedBackupMessage;
      output: DeleteDBInstanceAutomatedBackupResult;
    };
    sdk: {
      input: DeleteDBInstanceAutomatedBackupCommandInput;
      output: DeleteDBInstanceAutomatedBackupCommandOutput;
    };
  };
}
