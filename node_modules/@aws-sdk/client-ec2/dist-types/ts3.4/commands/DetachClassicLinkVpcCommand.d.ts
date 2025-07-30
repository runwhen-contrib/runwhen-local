import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DetachClassicLinkVpcRequest,
  DetachClassicLinkVpcResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DetachClassicLinkVpcCommandInput
  extends DetachClassicLinkVpcRequest {}
export interface DetachClassicLinkVpcCommandOutput
  extends DetachClassicLinkVpcResult,
    __MetadataBearer {}
declare const DetachClassicLinkVpcCommand_base: {
  new (
    input: DetachClassicLinkVpcCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DetachClassicLinkVpcCommandInput,
    DetachClassicLinkVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DetachClassicLinkVpcCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DetachClassicLinkVpcCommandInput,
    DetachClassicLinkVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DetachClassicLinkVpcCommand extends DetachClassicLinkVpcCommand_base {
  protected static __types: {
    api: {
      input: DetachClassicLinkVpcRequest;
      output: DetachClassicLinkVpcResult;
    };
    sdk: {
      input: DetachClassicLinkVpcCommandInput;
      output: DetachClassicLinkVpcCommandOutput;
    };
  };
}
