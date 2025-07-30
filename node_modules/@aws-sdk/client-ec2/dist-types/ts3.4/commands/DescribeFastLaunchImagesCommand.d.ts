import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeFastLaunchImagesRequest,
  DescribeFastLaunchImagesResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeFastLaunchImagesCommandInput
  extends DescribeFastLaunchImagesRequest {}
export interface DescribeFastLaunchImagesCommandOutput
  extends DescribeFastLaunchImagesResult,
    __MetadataBearer {}
declare const DescribeFastLaunchImagesCommand_base: {
  new (
    input: DescribeFastLaunchImagesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeFastLaunchImagesCommandInput,
    DescribeFastLaunchImagesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeFastLaunchImagesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeFastLaunchImagesCommandInput,
    DescribeFastLaunchImagesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeFastLaunchImagesCommand extends DescribeFastLaunchImagesCommand_base {
  protected static __types: {
    api: {
      input: DescribeFastLaunchImagesRequest;
      output: DescribeFastLaunchImagesResult;
    };
    sdk: {
      input: DescribeFastLaunchImagesCommandInput;
      output: DescribeFastLaunchImagesCommandOutput;
    };
  };
}
