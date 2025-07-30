import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVerifiedAccessInstancesRequest,
  DescribeVerifiedAccessInstancesResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVerifiedAccessInstancesCommandInput
  extends DescribeVerifiedAccessInstancesRequest {}
export interface DescribeVerifiedAccessInstancesCommandOutput
  extends DescribeVerifiedAccessInstancesResult,
    __MetadataBearer {}
declare const DescribeVerifiedAccessInstancesCommand_base: {
  new (
    input: DescribeVerifiedAccessInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVerifiedAccessInstancesCommandInput,
    DescribeVerifiedAccessInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVerifiedAccessInstancesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVerifiedAccessInstancesCommandInput,
    DescribeVerifiedAccessInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVerifiedAccessInstancesCommand extends DescribeVerifiedAccessInstancesCommand_base {
  protected static __types: {
    api: {
      input: DescribeVerifiedAccessInstancesRequest;
      output: DescribeVerifiedAccessInstancesResult;
    };
    sdk: {
      input: DescribeVerifiedAccessInstancesCommandInput;
      output: DescribeVerifiedAccessInstancesCommandOutput;
    };
  };
}
