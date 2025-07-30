import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeTrafficMirrorTargetsRequest,
  DescribeTrafficMirrorTargetsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTrafficMirrorTargetsCommandInput
  extends DescribeTrafficMirrorTargetsRequest {}
export interface DescribeTrafficMirrorTargetsCommandOutput
  extends DescribeTrafficMirrorTargetsResult,
    __MetadataBearer {}
declare const DescribeTrafficMirrorTargetsCommand_base: {
  new (
    input: DescribeTrafficMirrorTargetsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTrafficMirrorTargetsCommandInput,
    DescribeTrafficMirrorTargetsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTrafficMirrorTargetsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTrafficMirrorTargetsCommandInput,
    DescribeTrafficMirrorTargetsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTrafficMirrorTargetsCommand extends DescribeTrafficMirrorTargetsCommand_base {
  protected static __types: {
    api: {
      input: DescribeTrafficMirrorTargetsRequest;
      output: DescribeTrafficMirrorTargetsResult;
    };
    sdk: {
      input: DescribeTrafficMirrorTargetsCommandInput;
      output: DescribeTrafficMirrorTargetsCommandOutput;
    };
  };
}
