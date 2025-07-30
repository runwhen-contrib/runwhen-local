import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateNetworkInterfacePermissionRequest,
  CreateNetworkInterfacePermissionResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateNetworkInterfacePermissionCommandInput
  extends CreateNetworkInterfacePermissionRequest {}
export interface CreateNetworkInterfacePermissionCommandOutput
  extends CreateNetworkInterfacePermissionResult,
    __MetadataBearer {}
declare const CreateNetworkInterfacePermissionCommand_base: {
  new (
    input: CreateNetworkInterfacePermissionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateNetworkInterfacePermissionCommandInput,
    CreateNetworkInterfacePermissionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateNetworkInterfacePermissionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateNetworkInterfacePermissionCommandInput,
    CreateNetworkInterfacePermissionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateNetworkInterfacePermissionCommand extends CreateNetworkInterfacePermissionCommand_base {
  protected static __types: {
    api: {
      input: CreateNetworkInterfacePermissionRequest;
      output: CreateNetworkInterfacePermissionResult;
    };
    sdk: {
      input: CreateNetworkInterfacePermissionCommandInput;
      output: CreateNetworkInterfacePermissionCommandOutput;
    };
  };
}
