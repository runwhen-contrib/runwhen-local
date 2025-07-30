import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVolumesRequest,
  DescribeVolumesResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVolumesCommandInput extends DescribeVolumesRequest {}
export interface DescribeVolumesCommandOutput
  extends DescribeVolumesResult,
    __MetadataBearer {}
declare const DescribeVolumesCommand_base: {
  new (
    input: DescribeVolumesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVolumesCommandInput,
    DescribeVolumesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVolumesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVolumesCommandInput,
    DescribeVolumesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVolumesCommand extends DescribeVolumesCommand_base {
  protected static __types: {
    api: {
      input: DescribeVolumesRequest;
      output: DescribeVolumesResult;
    };
    sdk: {
      input: DescribeVolumesCommandInput;
      output: DescribeVolumesCommandOutput;
    };
  };
}
