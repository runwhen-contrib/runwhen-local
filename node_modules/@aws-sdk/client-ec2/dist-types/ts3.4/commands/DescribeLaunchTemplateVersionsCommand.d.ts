import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeLaunchTemplateVersionsRequest,
  DescribeLaunchTemplateVersionsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeLaunchTemplateVersionsCommandInput
  extends DescribeLaunchTemplateVersionsRequest {}
export interface DescribeLaunchTemplateVersionsCommandOutput
  extends DescribeLaunchTemplateVersionsResult,
    __MetadataBearer {}
declare const DescribeLaunchTemplateVersionsCommand_base: {
  new (
    input: DescribeLaunchTemplateVersionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLaunchTemplateVersionsCommandInput,
    DescribeLaunchTemplateVersionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeLaunchTemplateVersionsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLaunchTemplateVersionsCommandInput,
    DescribeLaunchTemplateVersionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeLaunchTemplateVersionsCommand extends DescribeLaunchTemplateVersionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeLaunchTemplateVersionsRequest;
      output: DescribeLaunchTemplateVersionsResult;
    };
    sdk: {
      input: DescribeLaunchTemplateVersionsCommandInput;
      output: DescribeLaunchTemplateVersionsCommandOutput;
    };
  };
}
