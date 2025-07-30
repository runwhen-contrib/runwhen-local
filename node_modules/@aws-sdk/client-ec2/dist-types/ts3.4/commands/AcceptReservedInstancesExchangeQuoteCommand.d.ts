import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AcceptReservedInstancesExchangeQuoteRequest,
  AcceptReservedInstancesExchangeQuoteResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AcceptReservedInstancesExchangeQuoteCommandInput
  extends AcceptReservedInstancesExchangeQuoteRequest {}
export interface AcceptReservedInstancesExchangeQuoteCommandOutput
  extends AcceptReservedInstancesExchangeQuoteResult,
    __MetadataBearer {}
declare const AcceptReservedInstancesExchangeQuoteCommand_base: {
  new (
    input: AcceptReservedInstancesExchangeQuoteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptReservedInstancesExchangeQuoteCommandInput,
    AcceptReservedInstancesExchangeQuoteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AcceptReservedInstancesExchangeQuoteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptReservedInstancesExchangeQuoteCommandInput,
    AcceptReservedInstancesExchangeQuoteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AcceptReservedInstancesExchangeQuoteCommand extends AcceptReservedInstancesExchangeQuoteCommand_base {
  protected static __types: {
    api: {
      input: AcceptReservedInstancesExchangeQuoteRequest;
      output: AcceptReservedInstancesExchangeQuoteResult;
    };
    sdk: {
      input: AcceptReservedInstancesExchangeQuoteCommandInput;
      output: AcceptReservedInstancesExchangeQuoteCommandOutput;
    };
  };
}
