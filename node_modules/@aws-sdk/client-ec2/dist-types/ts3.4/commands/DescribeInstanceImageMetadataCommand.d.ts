import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeInstanceImageMetadataRequest,
  DescribeInstanceImageMetadataResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeInstanceImageMetadataCommandInput
  extends DescribeInstanceImageMetadataRequest {}
export interface DescribeInstanceImageMetadataCommandOutput
  extends DescribeInstanceImageMetadataResult,
    __MetadataBearer {}
declare const DescribeInstanceImageMetadataCommand_base: {
  new (
    input: DescribeInstanceImageMetadataCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceImageMetadataCommandInput,
    DescribeInstanceImageMetadataCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeInstanceImageMetadataCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceImageMetadataCommandInput,
    DescribeInstanceImageMetadataCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeInstanceImageMetadataCommand extends DescribeInstanceImageMetadataCommand_base {
  protected static __types: {
    api: {
      input: DescribeInstanceImageMetadataRequest;
      output: DescribeInstanceImageMetadataResult;
    };
    sdk: {
      input: DescribeInstanceImageMetadataCommandInput;
      output: DescribeInstanceImageMetadataCommandOutput;
    };
  };
}
