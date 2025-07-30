import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateDBInstanceReadReplicaMessage,
  CreateDBInstanceReadReplicaResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateDBInstanceReadReplicaCommandInput
  extends CreateDBInstanceReadReplicaMessage {}
export interface CreateDBInstanceReadReplicaCommandOutput
  extends CreateDBInstanceReadReplicaResult,
    __MetadataBearer {}
declare const CreateDBInstanceReadReplicaCommand_base: {
  new (
    input: CreateDBInstanceReadReplicaCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBInstanceReadReplicaCommandInput,
    CreateDBInstanceReadReplicaCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateDBInstanceReadReplicaCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBInstanceReadReplicaCommandInput,
    CreateDBInstanceReadReplicaCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDBInstanceReadReplicaCommand extends CreateDBInstanceReadReplicaCommand_base {
  protected static __types: {
    api: {
      input: CreateDBInstanceReadReplicaMessage;
      output: CreateDBInstanceReadReplicaResult;
    };
    sdk: {
      input: CreateDBInstanceReadReplicaCommandInput;
      output: CreateDBInstanceReadReplicaCommandOutput;
    };
  };
}
