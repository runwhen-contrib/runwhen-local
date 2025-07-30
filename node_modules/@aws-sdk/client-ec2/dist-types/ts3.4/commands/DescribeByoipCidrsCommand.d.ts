import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeByoipCidrsRequest,
  DescribeByoipCidrsResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeByoipCidrsCommandInput
  extends DescribeByoipCidrsRequest {}
export interface DescribeByoipCidrsCommandOutput
  extends DescribeByoipCidrsResult,
    __MetadataBearer {}
declare const DescribeByoipCidrsCommand_base: {
  new (
    input: DescribeByoipCidrsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeByoipCidrsCommandInput,
    DescribeByoipCidrsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeByoipCidrsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeByoipCidrsCommandInput,
    DescribeByoipCidrsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeByoipCidrsCommand extends DescribeByoipCidrsCommand_base {
  protected static __types: {
    api: {
      input: DescribeByoipCidrsRequest;
      output: DescribeByoipCidrsResult;
    };
    sdk: {
      input: DescribeByoipCidrsCommandInput;
      output: DescribeByoipCidrsCommandOutput;
    };
  };
}
