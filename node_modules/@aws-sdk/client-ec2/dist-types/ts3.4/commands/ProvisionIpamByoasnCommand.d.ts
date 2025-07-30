import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ProvisionIpamByoasnRequest,
  ProvisionIpamByoasnResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ProvisionIpamByoasnCommandInput
  extends ProvisionIpamByoasnRequest {}
export interface ProvisionIpamByoasnCommandOutput
  extends ProvisionIpamByoasnResult,
    __MetadataBearer {}
declare const ProvisionIpamByoasnCommand_base: {
  new (
    input: ProvisionIpamByoasnCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ProvisionIpamByoasnCommandInput,
    ProvisionIpamByoasnCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ProvisionIpamByoasnCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ProvisionIpamByoasnCommandInput,
    ProvisionIpamByoasnCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ProvisionIpamByoasnCommand extends ProvisionIpamByoasnCommand_base {
  protected static __types: {
    api: {
      input: ProvisionIpamByoasnRequest;
      output: ProvisionIpamByoasnResult;
    };
    sdk: {
      input: ProvisionIpamByoasnCommandInput;
      output: ProvisionIpamByoasnCommandOutput;
    };
  };
}
