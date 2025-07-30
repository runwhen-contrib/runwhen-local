import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { AddRoleToDBInstanceMessage } from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface AddRoleToDBInstanceCommandInput
  extends AddRoleToDBInstanceMessage {}
export interface AddRoleToDBInstanceCommandOutput extends __MetadataBearer {}
declare const AddRoleToDBInstanceCommand_base: {
  new (
    input: AddRoleToDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AddRoleToDBInstanceCommandInput,
    AddRoleToDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AddRoleToDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AddRoleToDBInstanceCommandInput,
    AddRoleToDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AddRoleToDBInstanceCommand extends AddRoleToDBInstanceCommand_base {
  protected static __types: {
    api: {
      input: AddRoleToDBInstanceMessage;
      output: {};
    };
    sdk: {
      input: AddRoleToDBInstanceCommandInput;
      output: AddRoleToDBInstanceCommandOutput;
    };
  };
}
