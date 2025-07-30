import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeTrafficMirrorFiltersRequest,
  DescribeTrafficMirrorFiltersResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTrafficMirrorFiltersCommandInput
  extends DescribeTrafficMirrorFiltersRequest {}
export interface DescribeTrafficMirrorFiltersCommandOutput
  extends DescribeTrafficMirrorFiltersResult,
    __MetadataBearer {}
declare const DescribeTrafficMirrorFiltersCommand_base: {
  new (
    input: DescribeTrafficMirrorFiltersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTrafficMirrorFiltersCommandInput,
    DescribeTrafficMirrorFiltersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTrafficMirrorFiltersCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTrafficMirrorFiltersCommandInput,
    DescribeTrafficMirrorFiltersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTrafficMirrorFiltersCommand extends DescribeTrafficMirrorFiltersCommand_base {
  protected static __types: {
    api: {
      input: DescribeTrafficMirrorFiltersRequest;
      output: DescribeTrafficMirrorFiltersResult;
    };
    sdk: {
      input: DescribeTrafficMirrorFiltersCommandInput;
      output: DescribeTrafficMirrorFiltersCommandOutput;
    };
  };
}
