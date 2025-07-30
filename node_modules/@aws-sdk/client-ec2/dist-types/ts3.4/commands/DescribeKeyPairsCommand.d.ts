import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeKeyPairsRequest,
  DescribeKeyPairsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeKeyPairsCommandInput extends DescribeKeyPairsRequest {}
export interface DescribeKeyPairsCommandOutput
  extends DescribeKeyPairsResult,
    __MetadataBearer {}
declare const DescribeKeyPairsCommand_base: {
  new (
    input: DescribeKeyPairsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeKeyPairsCommandInput,
    DescribeKeyPairsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeKeyPairsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeKeyPairsCommandInput,
    DescribeKeyPairsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeKeyPairsCommand extends DescribeKeyPairsCommand_base {
  protected static __types: {
    api: {
      input: DescribeKeyPairsRequest;
      output: DescribeKeyPairsResult;
    };
    sdk: {
      input: DescribeKeyPairsCommandInput;
      output: DescribeKeyPairsCommandOutput;
    };
  };
}
