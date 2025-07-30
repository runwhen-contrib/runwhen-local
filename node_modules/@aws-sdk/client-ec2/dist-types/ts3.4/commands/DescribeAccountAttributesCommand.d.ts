import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeAccountAttributesRequest,
  DescribeAccountAttributesResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeAccountAttributesCommandInput
  extends DescribeAccountAttributesRequest {}
export interface DescribeAccountAttributesCommandOutput
  extends DescribeAccountAttributesResult,
    __MetadataBearer {}
declare const DescribeAccountAttributesCommand_base: {
  new (
    input: DescribeAccountAttributesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAccountAttributesCommandInput,
    DescribeAccountAttributesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeAccountAttributesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAccountAttributesCommandInput,
    DescribeAccountAttributesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeAccountAttributesCommand extends DescribeAccountAttributesCommand_base {
  protected static __types: {
    api: {
      input: DescribeAccountAttributesRequest;
      output: DescribeAccountAttributesResult;
    };
    sdk: {
      input: DescribeAccountAttributesCommandInput;
      output: DescribeAccountAttributesCommandOutput;
    };
  };
}
