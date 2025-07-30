import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DetachNetworkInterfaceRequest } from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DetachNetworkInterfaceCommandInput
  extends DetachNetworkInterfaceRequest {}
export interface DetachNetworkInterfaceCommandOutput extends __MetadataBearer {}
declare const DetachNetworkInterfaceCommand_base: {
  new (
    input: DetachNetworkInterfaceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DetachNetworkInterfaceCommandInput,
    DetachNetworkInterfaceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DetachNetworkInterfaceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DetachNetworkInterfaceCommandInput,
    DetachNetworkInterfaceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DetachNetworkInterfaceCommand extends DetachNetworkInterfaceCommand_base {
  protected static __types: {
    api: {
      input: DetachNetworkInterfaceRequest;
      output: {};
    };
    sdk: {
      input: DetachNetworkInterfaceCommandInput;
      output: DetachNetworkInterfaceCommandOutput;
    };
  };
}
