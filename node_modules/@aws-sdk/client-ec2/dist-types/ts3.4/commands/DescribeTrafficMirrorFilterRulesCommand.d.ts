import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeTrafficMirrorFilterRulesRequest,
  DescribeTrafficMirrorFilterRulesResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTrafficMirrorFilterRulesCommandInput
  extends DescribeTrafficMirrorFilterRulesRequest {}
export interface DescribeTrafficMirrorFilterRulesCommandOutput
  extends DescribeTrafficMirrorFilterRulesResult,
    __MetadataBearer {}
declare const DescribeTrafficMirrorFilterRulesCommand_base: {
  new (
    input: DescribeTrafficMirrorFilterRulesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTrafficMirrorFilterRulesCommandInput,
    DescribeTrafficMirrorFilterRulesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTrafficMirrorFilterRulesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTrafficMirrorFilterRulesCommandInput,
    DescribeTrafficMirrorFilterRulesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTrafficMirrorFilterRulesCommand extends DescribeTrafficMirrorFilterRulesCommand_base {
  protected static __types: {
    api: {
      input: DescribeTrafficMirrorFilterRulesRequest;
      output: DescribeTrafficMirrorFilterRulesResult;
    };
    sdk: {
      input: DescribeTrafficMirrorFilterRulesCommandInput;
      output: DescribeTrafficMirrorFilterRulesCommandOutput;
    };
  };
}
