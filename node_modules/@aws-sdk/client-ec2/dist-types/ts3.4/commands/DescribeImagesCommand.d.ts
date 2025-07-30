import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeImagesRequest,
  DescribeImagesResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeImagesCommandInput extends DescribeImagesRequest {}
export interface DescribeImagesCommandOutput
  extends DescribeImagesResult,
    __MetadataBearer {}
declare const DescribeImagesCommand_base: {
  new (
    input: DescribeImagesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeImagesCommandInput,
    DescribeImagesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeImagesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeImagesCommandInput,
    DescribeImagesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeImagesCommand extends DescribeImagesCommand_base {
  protected static __types: {
    api: {
      input: DescribeImagesRequest;
      output: DescribeImagesResult;
    };
    sdk: {
      input: DescribeImagesCommandInput;
      output: DescribeImagesCommandOutput;
    };
  };
}
