import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteNetworkInterfacePermissionRequest,
  DeleteNetworkInterfacePermissionResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteNetworkInterfacePermissionCommandInput
  extends DeleteNetworkInterfacePermissionRequest {}
export interface DeleteNetworkInterfacePermissionCommandOutput
  extends DeleteNetworkInterfacePermissionResult,
    __MetadataBearer {}
declare const DeleteNetworkInterfacePermissionCommand_base: {
  new (
    input: DeleteNetworkInterfacePermissionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNetworkInterfacePermissionCommandInput,
    DeleteNetworkInterfacePermissionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteNetworkInterfacePermissionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNetworkInterfacePermissionCommandInput,
    DeleteNetworkInterfacePermissionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteNetworkInterfacePermissionCommand extends DeleteNetworkInterfacePermissionCommand_base {
  protected static __types: {
    api: {
      input: DeleteNetworkInterfacePermissionRequest;
      output: DeleteNetworkInterfacePermissionResult;
    };
    sdk: {
      input: DeleteNetworkInterfacePermissionCommandInput;
      output: DeleteNetworkInterfacePermissionCommandOutput;
    };
  };
}
