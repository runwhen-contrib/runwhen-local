import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeAddressesAttributeRequest,
  DescribeAddressesAttributeResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeAddressesAttributeCommandInput
  extends DescribeAddressesAttributeRequest {}
export interface DescribeAddressesAttributeCommandOutput
  extends DescribeAddressesAttributeResult,
    __MetadataBearer {}
declare const DescribeAddressesAttributeCommand_base: {
  new (
    input: DescribeAddressesAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAddressesAttributeCommandInput,
    DescribeAddressesAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeAddressesAttributeCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAddressesAttributeCommandInput,
    DescribeAddressesAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeAddressesAttributeCommand extends DescribeAddressesAttributeCommand_base {
  protected static __types: {
    api: {
      input: DescribeAddressesAttributeRequest;
      output: DescribeAddressesAttributeResult;
    };
    sdk: {
      input: DescribeAddressesAttributeCommandInput;
      output: DescribeAddressesAttributeCommandOutput;
    };
  };
}
