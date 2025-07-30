import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateIpamByoasnRequest,
  AssociateIpamByoasnResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateIpamByoasnCommandInput
  extends AssociateIpamByoasnRequest {}
export interface AssociateIpamByoasnCommandOutput
  extends AssociateIpamByoasnResult,
    __MetadataBearer {}
declare const AssociateIpamByoasnCommand_base: {
  new (
    input: AssociateIpamByoasnCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateIpamByoasnCommandInput,
    AssociateIpamByoasnCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateIpamByoasnCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateIpamByoasnCommandInput,
    AssociateIpamByoasnCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateIpamByoasnCommand extends AssociateIpamByoasnCommand_base {
  protected static __types: {
    api: {
      input: AssociateIpamByoasnRequest;
      output: AssociateIpamByoasnResult;
    };
    sdk: {
      input: AssociateIpamByoasnCommandInput;
      output: AssociateIpamByoasnCommandOutput;
    };
  };
}
