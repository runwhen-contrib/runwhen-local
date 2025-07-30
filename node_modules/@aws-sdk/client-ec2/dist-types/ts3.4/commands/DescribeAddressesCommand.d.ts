import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeAddressesRequest,
  DescribeAddressesResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeAddressesCommandInput
  extends DescribeAddressesRequest {}
export interface DescribeAddressesCommandOutput
  extends DescribeAddressesResult,
    __MetadataBearer {}
declare const DescribeAddressesCommand_base: {
  new (
    input: DescribeAddressesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAddressesCommandInput,
    DescribeAddressesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeAddressesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAddressesCommandInput,
    DescribeAddressesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeAddressesCommand extends DescribeAddressesCommand_base {
  protected static __types: {
    api: {
      input: DescribeAddressesRequest;
      output: DescribeAddressesResult;
    };
    sdk: {
      input: DescribeAddressesCommandInput;
      output: DescribeAddressesCommandOutput;
    };
  };
}
