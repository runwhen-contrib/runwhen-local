import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeIdentityIdFormatRequest,
  DescribeIdentityIdFormatResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeIdentityIdFormatCommandInput
  extends DescribeIdentityIdFormatRequest {}
export interface DescribeIdentityIdFormatCommandOutput
  extends DescribeIdentityIdFormatResult,
    __MetadataBearer {}
declare const DescribeIdentityIdFormatCommand_base: {
  new (
    input: DescribeIdentityIdFormatCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIdentityIdFormatCommandInput,
    DescribeIdentityIdFormatCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeIdentityIdFormatCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIdentityIdFormatCommandInput,
    DescribeIdentityIdFormatCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeIdentityIdFormatCommand extends DescribeIdentityIdFormatCommand_base {
  protected static __types: {
    api: {
      input: DescribeIdentityIdFormatRequest;
      output: DescribeIdentityIdFormatResult;
    };
    sdk: {
      input: DescribeIdentityIdFormatCommandInput;
      output: DescribeIdentityIdFormatCommandOutput;
    };
  };
}
