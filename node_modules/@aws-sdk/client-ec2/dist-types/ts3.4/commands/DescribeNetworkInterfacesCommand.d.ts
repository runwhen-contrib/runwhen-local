import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeNetworkInterfacesRequest,
  DescribeNetworkInterfacesResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeNetworkInterfacesCommandInput
  extends DescribeNetworkInterfacesRequest {}
export interface DescribeNetworkInterfacesCommandOutput
  extends DescribeNetworkInterfacesResult,
    __MetadataBearer {}
declare const DescribeNetworkInterfacesCommand_base: {
  new (
    input: DescribeNetworkInterfacesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNetworkInterfacesCommandInput,
    DescribeNetworkInterfacesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeNetworkInterfacesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNetworkInterfacesCommandInput,
    DescribeNetworkInterfacesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeNetworkInterfacesCommand extends DescribeNetworkInterfacesCommand_base {
  protected static __types: {
    api: {
      input: DescribeNetworkInterfacesRequest;
      output: DescribeNetworkInterfacesResult;
    };
    sdk: {
      input: DescribeNetworkInterfacesCommandInput;
      output: DescribeNetworkInterfacesCommandOutput;
    };
  };
}
