import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeNetworkInterfacePermissionsRequest,
  DescribeNetworkInterfacePermissionsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeNetworkInterfacePermissionsCommandInput
  extends DescribeNetworkInterfacePermissionsRequest {}
export interface DescribeNetworkInterfacePermissionsCommandOutput
  extends DescribeNetworkInterfacePermissionsResult,
    __MetadataBearer {}
declare const DescribeNetworkInterfacePermissionsCommand_base: {
  new (
    input: DescribeNetworkInterfacePermissionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNetworkInterfacePermissionsCommandInput,
    DescribeNetworkInterfacePermissionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeNetworkInterfacePermissionsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNetworkInterfacePermissionsCommandInput,
    DescribeNetworkInterfacePermissionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeNetworkInterfacePermissionsCommand extends DescribeNetworkInterfacePermissionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeNetworkInterfacePermissionsRequest;
      output: DescribeNetworkInterfacePermissionsResult;
    };
    sdk: {
      input: DescribeNetworkInterfacePermissionsCommandInput;
      output: DescribeNetworkInterfacePermissionsCommandOutput;
    };
  };
}
