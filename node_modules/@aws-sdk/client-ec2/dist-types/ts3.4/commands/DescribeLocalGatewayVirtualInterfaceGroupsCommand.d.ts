import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeLocalGatewayVirtualInterfaceGroupsRequest,
  DescribeLocalGatewayVirtualInterfaceGroupsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeLocalGatewayVirtualInterfaceGroupsCommandInput
  extends DescribeLocalGatewayVirtualInterfaceGroupsRequest {}
export interface DescribeLocalGatewayVirtualInterfaceGroupsCommandOutput
  extends DescribeLocalGatewayVirtualInterfaceGroupsResult,
    __MetadataBearer {}
declare const DescribeLocalGatewayVirtualInterfaceGroupsCommand_base: {
  new (
    input: DescribeLocalGatewayVirtualInterfaceGroupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLocalGatewayVirtualInterfaceGroupsCommandInput,
    DescribeLocalGatewayVirtualInterfaceGroupsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeLocalGatewayVirtualInterfaceGroupsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLocalGatewayVirtualInterfaceGroupsCommandInput,
    DescribeLocalGatewayVirtualInterfaceGroupsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeLocalGatewayVirtualInterfaceGroupsCommand extends DescribeLocalGatewayVirtualInterfaceGroupsCommand_base {
  protected static __types: {
    api: {
      input: DescribeLocalGatewayVirtualInterfaceGroupsRequest;
      output: DescribeLocalGatewayVirtualInterfaceGroupsResult;
    };
    sdk: {
      input: DescribeLocalGatewayVirtualInterfaceGroupsCommandInput;
      output: DescribeLocalGatewayVirtualInterfaceGroupsCommandOutput;
    };
  };
}
