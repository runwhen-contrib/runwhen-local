import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeIdFormatRequest,
  DescribeIdFormatResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeIdFormatCommandInput extends DescribeIdFormatRequest {}
export interface DescribeIdFormatCommandOutput
  extends DescribeIdFormatResult,
    __MetadataBearer {}
declare const DescribeIdFormatCommand_base: {
  new (
    input: DescribeIdFormatCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIdFormatCommandInput,
    DescribeIdFormatCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeIdFormatCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIdFormatCommandInput,
    DescribeIdFormatCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeIdFormatCommand extends DescribeIdFormatCommand_base {
  protected static __types: {
    api: {
      input: DescribeIdFormatRequest;
      output: DescribeIdFormatResult;
    };
    sdk: {
      input: DescribeIdFormatCommandInput;
      output: DescribeIdFormatCommandOutput;
    };
  };
}
