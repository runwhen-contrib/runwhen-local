import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeLocalGatewayVirtualInterfacesRequest,
  DescribeLocalGatewayVirtualInterfacesResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeLocalGatewayVirtualInterfacesCommandInput
  extends DescribeLocalGatewayVirtualInterfacesRequest {}
export interface DescribeLocalGatewayVirtualInterfacesCommandOutput
  extends DescribeLocalGatewayVirtualInterfacesResult,
    __MetadataBearer {}
declare const DescribeLocalGatewayVirtualInterfacesCommand_base: {
  new (
    input: DescribeLocalGatewayVirtualInterfacesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLocalGatewayVirtualInterfacesCommandInput,
    DescribeLocalGatewayVirtualInterfacesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeLocalGatewayVirtualInterfacesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLocalGatewayVirtualInterfacesCommandInput,
    DescribeLocalGatewayVirtualInterfacesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeLocalGatewayVirtualInterfacesCommand extends DescribeLocalGatewayVirtualInterfacesCommand_base {
  protected static __types: {
    api: {
      input: DescribeLocalGatewayVirtualInterfacesRequest;
      output: DescribeLocalGatewayVirtualInterfacesResult;
    };
    sdk: {
      input: DescribeLocalGatewayVirtualInterfacesCommandInput;
      output: DescribeLocalGatewayVirtualInterfacesCommandOutput;
    };
  };
}
