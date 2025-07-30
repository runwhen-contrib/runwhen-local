import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateDBInstanceMessage,
  CreateDBInstanceResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateDBInstanceCommandInput extends CreateDBInstanceMessage {}
export interface CreateDBInstanceCommandOutput
  extends CreateDBInstanceResult,
    __MetadataBearer {}
declare const CreateDBInstanceCommand_base: {
  new (
    input: CreateDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBInstanceCommandInput,
    CreateDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBInstanceCommandInput,
    CreateDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDBInstanceCommand extends CreateDBInstanceCommand_base {
  protected static __types: {
    api: {
      input: CreateDBInstanceMessage;
      output: CreateDBInstanceResult;
    };
    sdk: {
      input: CreateDBInstanceCommandInput;
      output: CreateDBInstanceCommandOutput;
    };
  };
}
