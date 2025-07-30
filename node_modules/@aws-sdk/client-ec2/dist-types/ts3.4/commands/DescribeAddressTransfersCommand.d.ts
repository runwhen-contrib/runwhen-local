import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeAddressTransfersRequest,
  DescribeAddressTransfersResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeAddressTransfersCommandInput
  extends DescribeAddressTransfersRequest {}
export interface DescribeAddressTransfersCommandOutput
  extends DescribeAddressTransfersResult,
    __MetadataBearer {}
declare const DescribeAddressTransfersCommand_base: {
  new (
    input: DescribeAddressTransfersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAddressTransfersCommandInput,
    DescribeAddressTransfersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeAddressTransfersCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAddressTransfersCommandInput,
    DescribeAddressTransfersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeAddressTransfersCommand extends DescribeAddressTransfersCommand_base {
  protected static __types: {
    api: {
      input: DescribeAddressTransfersRequest;
      output: DescribeAddressTransfersResult;
    };
    sdk: {
      input: DescribeAddressTransfersCommandInput;
      output: DescribeAddressTransfersCommandOutput;
    };
  };
}
