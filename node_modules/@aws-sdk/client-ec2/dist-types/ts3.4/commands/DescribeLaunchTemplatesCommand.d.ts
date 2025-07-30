import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeLaunchTemplatesRequest,
  DescribeLaunchTemplatesResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeLaunchTemplatesCommandInput
  extends DescribeLaunchTemplatesRequest {}
export interface DescribeLaunchTemplatesCommandOutput
  extends DescribeLaunchTemplatesResult,
    __MetadataBearer {}
declare const DescribeLaunchTemplatesCommand_base: {
  new (
    input: DescribeLaunchTemplatesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLaunchTemplatesCommandInput,
    DescribeLaunchTemplatesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeLaunchTemplatesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLaunchTemplatesCommandInput,
    DescribeLaunchTemplatesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeLaunchTemplatesCommand extends DescribeLaunchTemplatesCommand_base {
  protected static __types: {
    api: {
      input: DescribeLaunchTemplatesRequest;
      output: DescribeLaunchTemplatesResult;
    };
    sdk: {
      input: DescribeLaunchTemplatesCommandInput;
      output: DescribeLaunchTemplatesCommandOutput;
    };
  };
}
