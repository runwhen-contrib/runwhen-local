import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeScheduledInstancesRequest,
  DescribeScheduledInstancesResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeScheduledInstancesCommandInput
  extends DescribeScheduledInstancesRequest {}
export interface DescribeScheduledInstancesCommandOutput
  extends DescribeScheduledInstancesResult,
    __MetadataBearer {}
declare const DescribeScheduledInstancesCommand_base: {
  new (
    input: DescribeScheduledInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeScheduledInstancesCommandInput,
    DescribeScheduledInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeScheduledInstancesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeScheduledInstancesCommandInput,
    DescribeScheduledInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeScheduledInstancesCommand extends DescribeScheduledInstancesCommand_base {
  protected static __types: {
    api: {
      input: DescribeScheduledInstancesRequest;
      output: DescribeScheduledInstancesResult;
    };
    sdk: {
      input: DescribeScheduledInstancesCommandInput;
      output: DescribeScheduledInstancesCommandOutput;
    };
  };
}
