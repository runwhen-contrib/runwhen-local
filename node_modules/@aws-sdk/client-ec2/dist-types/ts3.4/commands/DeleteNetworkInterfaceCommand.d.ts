import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteNetworkInterfaceRequest } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteNetworkInterfaceCommandInput
  extends DeleteNetworkInterfaceRequest {}
export interface DeleteNetworkInterfaceCommandOutput extends __MetadataBearer {}
declare const DeleteNetworkInterfaceCommand_base: {
  new (
    input: DeleteNetworkInterfaceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNetworkInterfaceCommandInput,
    DeleteNetworkInterfaceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteNetworkInterfaceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNetworkInterfaceCommandInput,
    DeleteNetworkInterfaceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteNetworkInterfaceCommand extends DeleteNetworkInterfaceCommand_base {
  protected static __types: {
    api: {
      input: DeleteNetworkInterfaceRequest;
      output: {};
    };
    sdk: {
      input: DeleteNetworkInterfaceCommandInput;
      output: DeleteNetworkInterfaceCommandOutput;
    };
  };
}
