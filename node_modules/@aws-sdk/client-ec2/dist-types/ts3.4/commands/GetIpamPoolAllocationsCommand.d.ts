import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetIpamPoolAllocationsRequest,
  GetIpamPoolAllocationsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetIpamPoolAllocationsCommandInput
  extends GetIpamPoolAllocationsRequest {}
export interface GetIpamPoolAllocationsCommandOutput
  extends GetIpamPoolAllocationsResult,
    __MetadataBearer {}
declare const GetIpamPoolAllocationsCommand_base: {
  new (
    input: GetIpamPoolAllocationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetIpamPoolAllocationsCommandInput,
    GetIpamPoolAllocationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetIpamPoolAllocationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetIpamPoolAllocationsCommandInput,
    GetIpamPoolAllocationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetIpamPoolAllocationsCommand extends GetIpamPoolAllocationsCommand_base {
  protected static __types: {
    api: {
      input: GetIpamPoolAllocationsRequest;
      output: GetIpamPoolAllocationsResult;
    };
    sdk: {
      input: GetIpamPoolAllocationsCommandInput;
      output: GetIpamPoolAllocationsCommandOutput;
    };
  };
}
