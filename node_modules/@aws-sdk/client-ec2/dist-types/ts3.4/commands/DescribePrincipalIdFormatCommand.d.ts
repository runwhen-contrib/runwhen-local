import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribePrincipalIdFormatRequest,
  DescribePrincipalIdFormatResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribePrincipalIdFormatCommandInput
  extends DescribePrincipalIdFormatRequest {}
export interface DescribePrincipalIdFormatCommandOutput
  extends DescribePrincipalIdFormatResult,
    __MetadataBearer {}
declare const DescribePrincipalIdFormatCommand_base: {
  new (
    input: DescribePrincipalIdFormatCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribePrincipalIdFormatCommandInput,
    DescribePrincipalIdFormatCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribePrincipalIdFormatCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribePrincipalIdFormatCommandInput,
    DescribePrincipalIdFormatCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribePrincipalIdFormatCommand extends DescribePrincipalIdFormatCommand_base {
  protected static __types: {
    api: {
      input: DescribePrincipalIdFormatRequest;
      output: DescribePrincipalIdFormatResult;
    };
    sdk: {
      input: DescribePrincipalIdFormatCommandInput;
      output: DescribePrincipalIdFormatCommandOutput;
    };
  };
}
