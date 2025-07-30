import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AttachNetworkInterfaceRequest,
  AttachNetworkInterfaceResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AttachNetworkInterfaceCommandInput
  extends AttachNetworkInterfaceRequest {}
export interface AttachNetworkInterfaceCommandOutput
  extends AttachNetworkInterfaceResult,
    __MetadataBearer {}
declare const AttachNetworkInterfaceCommand_base: {
  new (
    input: AttachNetworkInterfaceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AttachNetworkInterfaceCommandInput,
    AttachNetworkInterfaceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AttachNetworkInterfaceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AttachNetworkInterfaceCommandInput,
    AttachNetworkInterfaceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AttachNetworkInterfaceCommand extends AttachNetworkInterfaceCommand_base {
  protected static __types: {
    api: {
      input: AttachNetworkInterfaceRequest;
      output: AttachNetworkInterfaceResult;
    };
    sdk: {
      input: AttachNetworkInterfaceCommandInput;
      output: AttachNetworkInterfaceCommandOutput;
    };
  };
}
