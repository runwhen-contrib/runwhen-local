import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeInstanceTypesRequest,
  DescribeInstanceTypesResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeInstanceTypesCommandInput
  extends DescribeInstanceTypesRequest {}
export interface DescribeInstanceTypesCommandOutput
  extends DescribeInstanceTypesResult,
    __MetadataBearer {}
declare const DescribeInstanceTypesCommand_base: {
  new (
    input: DescribeInstanceTypesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceTypesCommandInput,
    DescribeInstanceTypesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeInstanceTypesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceTypesCommandInput,
    DescribeInstanceTypesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeInstanceTypesCommand extends DescribeInstanceTypesCommand_base {
  protected static __types: {
    api: {
      input: DescribeInstanceTypesRequest;
      output: DescribeInstanceTypesResult;
    };
    sdk: {
      input: DescribeInstanceTypesCommandInput;
      output: DescribeInstanceTypesCommandOutput;
    };
  };
}
