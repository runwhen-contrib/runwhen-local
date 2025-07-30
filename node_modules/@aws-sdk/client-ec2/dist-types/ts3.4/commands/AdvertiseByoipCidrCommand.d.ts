import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AdvertiseByoipCidrRequest,
  AdvertiseByoipCidrResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AdvertiseByoipCidrCommandInput
  extends AdvertiseByoipCidrRequest {}
export interface AdvertiseByoipCidrCommandOutput
  extends AdvertiseByoipCidrResult,
    __MetadataBearer {}
declare const AdvertiseByoipCidrCommand_base: {
  new (
    input: AdvertiseByoipCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AdvertiseByoipCidrCommandInput,
    AdvertiseByoipCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AdvertiseByoipCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AdvertiseByoipCidrCommandInput,
    AdvertiseByoipCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AdvertiseByoipCidrCommand extends AdvertiseByoipCidrCommand_base {
  protected static __types: {
    api: {
      input: AdvertiseByoipCidrRequest;
      output: AdvertiseByoipCidrResult;
    };
    sdk: {
      input: AdvertiseByoipCidrCommandInput;
      output: AdvertiseByoipCidrCommandOutput;
    };
  };
}
