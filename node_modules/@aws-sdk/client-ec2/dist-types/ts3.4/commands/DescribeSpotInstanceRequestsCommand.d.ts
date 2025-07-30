import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeSpotInstanceRequestsRequest,
  DescribeSpotInstanceRequestsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeSpotInstanceRequestsCommandInput
  extends DescribeSpotInstanceRequestsRequest {}
export interface DescribeSpotInstanceRequestsCommandOutput
  extends DescribeSpotInstanceRequestsResult,
    __MetadataBearer {}
declare const DescribeSpotInstanceRequestsCommand_base: {
  new (
    input: DescribeSpotInstanceRequestsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSpotInstanceRequestsCommandInput,
    DescribeSpotInstanceRequestsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeSpotInstanceRequestsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSpotInstanceRequestsCommandInput,
    DescribeSpotInstanceRequestsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeSpotInstanceRequestsCommand extends DescribeSpotInstanceRequestsCommand_base {
  protected static __types: {
    api: {
      input: DescribeSpotInstanceRequestsRequest;
      output: DescribeSpotInstanceRequestsResult;
    };
    sdk: {
      input: DescribeSpotInstanceRequestsCommandInput;
      output: DescribeSpotInstanceRequestsCommandOutput;
    };
  };
}
