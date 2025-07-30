import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AttachClassicLinkVpcRequest,
  AttachClassicLinkVpcResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AttachClassicLinkVpcCommandInput
  extends AttachClassicLinkVpcRequest {}
export interface AttachClassicLinkVpcCommandOutput
  extends AttachClassicLinkVpcResult,
    __MetadataBearer {}
declare const AttachClassicLinkVpcCommand_base: {
  new (
    input: AttachClassicLinkVpcCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AttachClassicLinkVpcCommandInput,
    AttachClassicLinkVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AttachClassicLinkVpcCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AttachClassicLinkVpcCommandInput,
    AttachClassicLinkVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AttachClassicLinkVpcCommand extends AttachClassicLinkVpcCommand_base {
  protected static __types: {
    api: {
      input: AttachClassicLinkVpcRequest;
      output: AttachClassicLinkVpcResult;
    };
    sdk: {
      input: AttachClassicLinkVpcCommandInput;
      output: AttachClassicLinkVpcCommandOutput;
    };
  };
}
