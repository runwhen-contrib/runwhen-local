import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeSpotFleetRequestsRequest,
  DescribeSpotFleetRequestsResponse,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeSpotFleetRequestsCommandInput
  extends DescribeSpotFleetRequestsRequest {}
export interface DescribeSpotFleetRequestsCommandOutput
  extends DescribeSpotFleetRequestsResponse,
    __MetadataBearer {}
declare const DescribeSpotFleetRequestsCommand_base: {
  new (
    input: DescribeSpotFleetRequestsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSpotFleetRequestsCommandInput,
    DescribeSpotFleetRequestsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeSpotFleetRequestsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSpotFleetRequestsCommandInput,
    DescribeSpotFleetRequestsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeSpotFleetRequestsCommand extends DescribeSpotFleetRequestsCommand_base {
  protected static __types: {
    api: {
      input: DescribeSpotFleetRequestsRequest;
      output: DescribeSpotFleetRequestsResponse;
    };
    sdk: {
      input: DescribeSpotFleetRequestsCommandInput;
      output: DescribeSpotFleetRequestsCommandOutput;
    };
  };
}
