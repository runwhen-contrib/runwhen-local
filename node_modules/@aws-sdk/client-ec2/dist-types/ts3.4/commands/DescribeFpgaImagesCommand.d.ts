import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeFpgaImagesRequest,
  DescribeFpgaImagesResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeFpgaImagesCommandInput
  extends DescribeFpgaImagesRequest {}
export interface DescribeFpgaImagesCommandOutput
  extends DescribeFpgaImagesResult,
    __MetadataBearer {}
declare const DescribeFpgaImagesCommand_base: {
  new (
    input: DescribeFpgaImagesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeFpgaImagesCommandInput,
    DescribeFpgaImagesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeFpgaImagesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeFpgaImagesCommandInput,
    DescribeFpgaImagesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeFpgaImagesCommand extends DescribeFpgaImagesCommand_base {
  protected static __types: {
    api: {
      input: DescribeFpgaImagesRequest;
      output: DescribeFpgaImagesResult;
    };
    sdk: {
      input: DescribeFpgaImagesCommandInput;
      output: DescribeFpgaImagesCommandOutput;
    };
  };
}
