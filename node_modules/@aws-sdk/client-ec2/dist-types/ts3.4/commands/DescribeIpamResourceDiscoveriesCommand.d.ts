import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeIpamResourceDiscoveriesRequest,
  DescribeIpamResourceDiscoveriesResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeIpamResourceDiscoveriesCommandInput
  extends DescribeIpamResourceDiscoveriesRequest {}
export interface DescribeIpamResourceDiscoveriesCommandOutput
  extends DescribeIpamResourceDiscoveriesResult,
    __MetadataBearer {}
declare const DescribeIpamResourceDiscoveriesCommand_base: {
  new (
    input: DescribeIpamResourceDiscoveriesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpamResourceDiscoveriesCommandInput,
    DescribeIpamResourceDiscoveriesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeIpamResourceDiscoveriesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpamResourceDiscoveriesCommandInput,
    DescribeIpamResourceDiscoveriesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeIpamResourceDiscoveriesCommand extends DescribeIpamResourceDiscoveriesCommand_base {
  protected static __types: {
    api: {
      input: DescribeIpamResourceDiscoveriesRequest;
      output: DescribeIpamResourceDiscoveriesResult;
    };
    sdk: {
      input: DescribeIpamResourceDiscoveriesCommandInput;
      output: DescribeIpamResourceDiscoveriesCommandOutput;
    };
  };
}
