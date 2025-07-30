import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVerifiedAccessTrustProvidersRequest,
  DescribeVerifiedAccessTrustProvidersResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVerifiedAccessTrustProvidersCommandInput
  extends DescribeVerifiedAccessTrustProvidersRequest {}
export interface DescribeVerifiedAccessTrustProvidersCommandOutput
  extends DescribeVerifiedAccessTrustProvidersResult,
    __MetadataBearer {}
declare const DescribeVerifiedAccessTrustProvidersCommand_base: {
  new (
    input: DescribeVerifiedAccessTrustProvidersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVerifiedAccessTrustProvidersCommandInput,
    DescribeVerifiedAccessTrustProvidersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVerifiedAccessTrustProvidersCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVerifiedAccessTrustProvidersCommandInput,
    DescribeVerifiedAccessTrustProvidersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVerifiedAccessTrustProvidersCommand extends DescribeVerifiedAccessTrustProvidersCommand_base {
  protected static __types: {
    api: {
      input: DescribeVerifiedAccessTrustProvidersRequest;
      output: DescribeVerifiedAccessTrustProvidersResult;
    };
    sdk: {
      input: DescribeVerifiedAccessTrustProvidersCommandInput;
      output: DescribeVerifiedAccessTrustProvidersCommandOutput;
    };
  };
}
