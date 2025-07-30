import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeTrafficMirrorSessionsRequest,
  DescribeTrafficMirrorSessionsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTrafficMirrorSessionsCommandInput
  extends DescribeTrafficMirrorSessionsRequest {}
export interface DescribeTrafficMirrorSessionsCommandOutput
  extends DescribeTrafficMirrorSessionsResult,
    __MetadataBearer {}
declare const DescribeTrafficMirrorSessionsCommand_base: {
  new (
    input: DescribeTrafficMirrorSessionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTrafficMirrorSessionsCommandInput,
    DescribeTrafficMirrorSessionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTrafficMirrorSessionsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTrafficMirrorSessionsCommandInput,
    DescribeTrafficMirrorSessionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTrafficMirrorSessionsCommand extends DescribeTrafficMirrorSessionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeTrafficMirrorSessionsRequest;
      output: DescribeTrafficMirrorSessionsResult;
    };
    sdk: {
      input: DescribeTrafficMirrorSessionsCommandInput;
      output: DescribeTrafficMirrorSessionsCommandOutput;
    };
  };
}
