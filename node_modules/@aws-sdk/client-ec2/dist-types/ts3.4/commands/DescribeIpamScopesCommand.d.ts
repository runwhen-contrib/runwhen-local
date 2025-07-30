import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeIpamScopesRequest,
  DescribeIpamScopesResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeIpamScopesCommandInput
  extends DescribeIpamScopesRequest {}
export interface DescribeIpamScopesCommandOutput
  extends DescribeIpamScopesResult,
    __MetadataBearer {}
declare const DescribeIpamScopesCommand_base: {
  new (
    input: DescribeIpamScopesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpamScopesCommandInput,
    DescribeIpamScopesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeIpamScopesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpamScopesCommandInput,
    DescribeIpamScopesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeIpamScopesCommand extends DescribeIpamScopesCommand_base {
  protected static __types: {
    api: {
      input: DescribeIpamScopesRequest;
      output: DescribeIpamScopesResult;
    };
    sdk: {
      input: DescribeIpamScopesCommandInput;
      output: DescribeIpamScopesCommandOutput;
    };
  };
}
