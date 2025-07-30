import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { AddRoleToDBClusterMessage } from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface AddRoleToDBClusterCommandInput
  extends AddRoleToDBClusterMessage {}
export interface AddRoleToDBClusterCommandOutput extends __MetadataBearer {}
declare const AddRoleToDBClusterCommand_base: {
  new (
    input: AddRoleToDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AddRoleToDBClusterCommandInput,
    AddRoleToDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AddRoleToDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AddRoleToDBClusterCommandInput,
    AddRoleToDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AddRoleToDBClusterCommand extends AddRoleToDBClusterCommand_base {
  protected static __types: {
    api: {
      input: AddRoleToDBClusterMessage;
      output: {};
    };
    sdk: {
      input: AddRoleToDBClusterCommandInput;
      output: AddRoleToDBClusterCommandOutput;
    };
  };
}
