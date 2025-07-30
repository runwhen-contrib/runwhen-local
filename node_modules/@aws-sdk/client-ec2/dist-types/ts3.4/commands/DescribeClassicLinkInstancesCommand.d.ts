import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeClassicLinkInstancesRequest,
  DescribeClassicLinkInstancesResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeClassicLinkInstancesCommandInput
  extends DescribeClassicLinkInstancesRequest {}
export interface DescribeClassicLinkInstancesCommandOutput
  extends DescribeClassicLinkInstancesResult,
    __MetadataBearer {}
declare const DescribeClassicLinkInstancesCommand_base: {
  new (
    input: DescribeClassicLinkInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeClassicLinkInstancesCommandInput,
    DescribeClassicLinkInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeClassicLinkInstancesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeClassicLinkInstancesCommandInput,
    DescribeClassicLinkInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeClassicLinkInstancesCommand extends DescribeClassicLinkInstancesCommand_base {
  protected static __types: {
    api: {
      input: DescribeClassicLinkInstancesRequest;
      output: DescribeClassicLinkInstancesResult;
    };
    sdk: {
      input: DescribeClassicLinkInstancesCommandInput;
      output: DescribeClassicLinkInstancesCommandOutput;
    };
  };
}
