import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVerifiedAccessInstanceLoggingConfigurationsRequest,
  DescribeVerifiedAccessInstanceLoggingConfigurationsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVerifiedAccessInstanceLoggingConfigurationsCommandInput
  extends DescribeVerifiedAccessInstanceLoggingConfigurationsRequest {}
export interface DescribeVerifiedAccessInstanceLoggingConfigurationsCommandOutput
  extends DescribeVerifiedAccessInstanceLoggingConfigurationsResult,
    __MetadataBearer {}
declare const DescribeVerifiedAccessInstanceLoggingConfigurationsCommand_base: {
  new (
    input: DescribeVerifiedAccessInstanceLoggingConfigurationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVerifiedAccessInstanceLoggingConfigurationsCommandInput,
    DescribeVerifiedAccessInstanceLoggingConfigurationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]:
      | []
      | [DescribeVerifiedAccessInstanceLoggingConfigurationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVerifiedAccessInstanceLoggingConfigurationsCommandInput,
    DescribeVerifiedAccessInstanceLoggingConfigurationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVerifiedAccessInstanceLoggingConfigurationsCommand extends DescribeVerifiedAccessInstanceLoggingConfigurationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeVerifiedAccessInstanceLoggingConfigurationsRequest;
      output: DescribeVerifiedAccessInstanceLoggingConfigurationsResult;
    };
    sdk: {
      input: DescribeVerifiedAccessInstanceLoggingConfigurationsCommandInput;
      output: DescribeVerifiedAccessInstanceLoggingConfigurationsCommandOutput;
    };
  };
}
