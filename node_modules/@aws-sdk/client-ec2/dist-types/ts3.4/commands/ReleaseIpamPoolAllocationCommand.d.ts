import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ReleaseIpamPoolAllocationRequest,
  ReleaseIpamPoolAllocationResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ReleaseIpamPoolAllocationCommandInput
  extends ReleaseIpamPoolAllocationRequest {}
export interface ReleaseIpamPoolAllocationCommandOutput
  extends ReleaseIpamPoolAllocationResult,
    __MetadataBearer {}
declare const ReleaseIpamPoolAllocationCommand_base: {
  new (
    input: ReleaseIpamPoolAllocationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReleaseIpamPoolAllocationCommandInput,
    ReleaseIpamPoolAllocationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ReleaseIpamPoolAllocationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReleaseIpamPoolAllocationCommandInput,
    ReleaseIpamPoolAllocationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ReleaseIpamPoolAllocationCommand extends ReleaseIpamPoolAllocationCommand_base {
  protected static __types: {
    api: {
      input: ReleaseIpamPoolAllocationRequest;
      output: ReleaseIpamPoolAllocationResult;
    };
    sdk: {
      input: ReleaseIpamPoolAllocationCommandInput;
      output: ReleaseIpamPoolAllocationCommandOutput;
    };
  };
}
