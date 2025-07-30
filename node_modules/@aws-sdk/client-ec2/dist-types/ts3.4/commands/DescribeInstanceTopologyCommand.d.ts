import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeInstanceTopologyRequest,
  DescribeInstanceTopologyResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeInstanceTopologyCommandInput
  extends DescribeInstanceTopologyRequest {}
export interface DescribeInstanceTopologyCommandOutput
  extends DescribeInstanceTopologyResult,
    __MetadataBearer {}
declare const DescribeInstanceTopologyCommand_base: {
  new (
    input: DescribeInstanceTopologyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceTopologyCommandInput,
    DescribeInstanceTopologyCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeInstanceTopologyCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceTopologyCommandInput,
    DescribeInstanceTopologyCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeInstanceTopologyCommand extends DescribeInstanceTopologyCommand_base {
  protected static __types: {
    api: {
      input: DescribeInstanceTopologyRequest;
      output: DescribeInstanceTopologyResult;
    };
    sdk: {
      input: DescribeInstanceTopologyCommandInput;
      output: DescribeInstanceTopologyCommandOutput;
    };
  };
}
