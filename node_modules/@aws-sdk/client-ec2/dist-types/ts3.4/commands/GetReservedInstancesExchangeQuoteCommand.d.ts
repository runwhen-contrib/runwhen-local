import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetReservedInstancesExchangeQuoteRequest,
  GetReservedInstancesExchangeQuoteResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetReservedInstancesExchangeQuoteCommandInput
  extends GetReservedInstancesExchangeQuoteRequest {}
export interface GetReservedInstancesExchangeQuoteCommandOutput
  extends GetReservedInstancesExchangeQuoteResult,
    __MetadataBearer {}
declare const GetReservedInstancesExchangeQuoteCommand_base: {
  new (
    input: GetReservedInstancesExchangeQuoteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetReservedInstancesExchangeQuoteCommandInput,
    GetReservedInstancesExchangeQuoteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetReservedInstancesExchangeQuoteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetReservedInstancesExchangeQuoteCommandInput,
    GetReservedInstancesExchangeQuoteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetReservedInstancesExchangeQuoteCommand extends GetReservedInstancesExchangeQuoteCommand_base {
  protected static __types: {
    api: {
      input: GetReservedInstancesExchangeQuoteRequest;
      output: GetReservedInstancesExchangeQuoteResult;
    };
    sdk: {
      input: GetReservedInstancesExchangeQuoteCommandInput;
      output: GetReservedInstancesExchangeQuoteCommandOutput;
    };
  };
}
