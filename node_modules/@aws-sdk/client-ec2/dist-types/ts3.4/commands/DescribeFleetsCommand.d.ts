import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeFleetsRequest,
  DescribeFleetsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeFleetsCommandInput extends DescribeFleetsRequest {}
export interface DescribeFleetsCommandOutput
  extends DescribeFleetsResult,
    __MetadataBearer {}
declare const DescribeFleetsCommand_base: {
  new (
    input: DescribeFleetsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeFleetsCommandInput,
    DescribeFleetsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeFleetsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeFleetsCommandInput,
    DescribeFleetsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeFleetsCommand extends DescribeFleetsCommand_base {
  protected static __types: {
    api: {
      input: DescribeFleetsRequest;
      output: DescribeFleetsResult;
    };
    sdk: {
      input: DescribeFleetsCommandInput;
      output: DescribeFleetsCommandOutput;
    };
  };
}
