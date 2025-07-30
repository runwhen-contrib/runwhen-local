import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeIpamResourceDiscoveryAssociationsRequest,
  DescribeIpamResourceDiscoveryAssociationsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeIpamResourceDiscoveryAssociationsCommandInput
  extends DescribeIpamResourceDiscoveryAssociationsRequest {}
export interface DescribeIpamResourceDiscoveryAssociationsCommandOutput
  extends DescribeIpamResourceDiscoveryAssociationsResult,
    __MetadataBearer {}
declare const DescribeIpamResourceDiscoveryAssociationsCommand_base: {
  new (
    input: DescribeIpamResourceDiscoveryAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpamResourceDiscoveryAssociationsCommandInput,
    DescribeIpamResourceDiscoveryAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeIpamResourceDiscoveryAssociationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpamResourceDiscoveryAssociationsCommandInput,
    DescribeIpamResourceDiscoveryAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeIpamResourceDiscoveryAssociationsCommand extends DescribeIpamResourceDiscoveryAssociationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeIpamResourceDiscoveryAssociationsRequest;
      output: DescribeIpamResourceDiscoveryAssociationsResult;
    };
    sdk: {
      input: DescribeIpamResourceDiscoveryAssociationsCommandInput;
      output: DescribeIpamResourceDiscoveryAssociationsCommandOutput;
    };
  };
}
