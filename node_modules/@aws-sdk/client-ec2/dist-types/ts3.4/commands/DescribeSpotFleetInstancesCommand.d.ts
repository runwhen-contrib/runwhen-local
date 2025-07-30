import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeSpotFleetInstancesRequest,
  DescribeSpotFleetInstancesResponse,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeSpotFleetInstancesCommandInput
  extends DescribeSpotFleetInstancesRequest {}
export interface DescribeSpotFleetInstancesCommandOutput
  extends DescribeSpotFleetInstancesResponse,
    __MetadataBearer {}
declare const DescribeSpotFleetInstancesCommand_base: {
  new (
    input: DescribeSpotFleetInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSpotFleetInstancesCommandInput,
    DescribeSpotFleetInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeSpotFleetInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSpotFleetInstancesCommandInput,
    DescribeSpotFleetInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeSpotFleetInstancesCommand extends DescribeSpotFleetInstancesCommand_base {
  protected static __types: {
    api: {
      input: DescribeSpotFleetInstancesRequest;
      output: DescribeSpotFleetInstancesResponse;
    };
    sdk: {
      input: DescribeSpotFleetInstancesCommandInput;
      output: DescribeSpotFleetInstancesCommandOutput;
    };
  };
}
