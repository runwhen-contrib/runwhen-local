import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeprovisionIpamByoasnRequest,
  DeprovisionIpamByoasnResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeprovisionIpamByoasnCommandInput
  extends DeprovisionIpamByoasnRequest {}
export interface DeprovisionIpamByoasnCommandOutput
  extends DeprovisionIpamByoasnResult,
    __MetadataBearer {}
declare const DeprovisionIpamByoasnCommand_base: {
  new (
    input: DeprovisionIpamByoasnCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeprovisionIpamByoasnCommandInput,
    DeprovisionIpamByoasnCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeprovisionIpamByoasnCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeprovisionIpamByoasnCommandInput,
    DeprovisionIpamByoasnCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeprovisionIpamByoasnCommand extends DeprovisionIpamByoasnCommand_base {
  protected static __types: {
    api: {
      input: DeprovisionIpamByoasnRequest;
      output: DeprovisionIpamByoasnResult;
    };
    sdk: {
      input: DeprovisionIpamByoasnCommandInput;
      output: DeprovisionIpamByoasnCommandOutput;
    };
  };
}
