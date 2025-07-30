import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeSpotFleetRequestHistoryRequest,
  DescribeSpotFleetRequestHistoryResponse,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeSpotFleetRequestHistoryCommandInput
  extends DescribeSpotFleetRequestHistoryRequest {}
export interface DescribeSpotFleetRequestHistoryCommandOutput
  extends DescribeSpotFleetRequestHistoryResponse,
    __MetadataBearer {}
declare const DescribeSpotFleetRequestHistoryCommand_base: {
  new (
    input: DescribeSpotFleetRequestHistoryCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSpotFleetRequestHistoryCommandInput,
    DescribeSpotFleetRequestHistoryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeSpotFleetRequestHistoryCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSpotFleetRequestHistoryCommandInput,
    DescribeSpotFleetRequestHistoryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeSpotFleetRequestHistoryCommand extends DescribeSpotFleetRequestHistoryCommand_base {
  protected static __types: {
    api: {
      input: DescribeSpotFleetRequestHistoryRequest;
      output: DescribeSpotFleetRequestHistoryResponse;
    };
    sdk: {
      input: DescribeSpotFleetRequestHistoryCommandInput;
      output: DescribeSpotFleetRequestHistoryCommandOutput;
    };
  };
}
