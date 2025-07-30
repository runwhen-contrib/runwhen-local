import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AcceptAddressTransferRequest,
  AcceptAddressTransferResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AcceptAddressTransferCommandInput
  extends AcceptAddressTransferRequest {}
export interface AcceptAddressTransferCommandOutput
  extends AcceptAddressTransferResult,
    __MetadataBearer {}
declare const AcceptAddressTransferCommand_base: {
  new (
    input: AcceptAddressTransferCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptAddressTransferCommandInput,
    AcceptAddressTransferCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AcceptAddressTransferCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptAddressTransferCommandInput,
    AcceptAddressTransferCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AcceptAddressTransferCommand extends AcceptAddressTransferCommand_base {
  protected static __types: {
    api: {
      input: AcceptAddressTransferRequest;
      output: AcceptAddressTransferResult;
    };
    sdk: {
      input: AcceptAddressTransferCommandInput;
      output: AcceptAddressTransferCommandOutput;
    };
  };
}
