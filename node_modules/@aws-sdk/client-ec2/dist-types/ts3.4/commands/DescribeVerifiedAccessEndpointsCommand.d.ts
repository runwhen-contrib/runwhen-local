import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVerifiedAccessEndpointsRequest,
  DescribeVerifiedAccessEndpointsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVerifiedAccessEndpointsCommandInput
  extends DescribeVerifiedAccessEndpointsRequest {}
export interface DescribeVerifiedAccessEndpointsCommandOutput
  extends DescribeVerifiedAccessEndpointsResult,
    __MetadataBearer {}
declare const DescribeVerifiedAccessEndpointsCommand_base: {
  new (
    input: DescribeVerifiedAccessEndpointsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVerifiedAccessEndpointsCommandInput,
    DescribeVerifiedAccessEndpointsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVerifiedAccessEndpointsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVerifiedAccessEndpointsCommandInput,
    DescribeVerifiedAccessEndpointsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVerifiedAccessEndpointsCommand extends DescribeVerifiedAccessEndpointsCommand_base {
  protected static __types: {
    api: {
      input: DescribeVerifiedAccessEndpointsRequest;
      output: DescribeVerifiedAccessEndpointsResult;
    };
    sdk: {
      input: DescribeVerifiedAccessEndpointsCommandInput;
      output: DescribeVerifiedAccessEndpointsCommandOutput;
    };
  };
}
