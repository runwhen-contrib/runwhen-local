import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateAddressRequest,
  AssociateAddressResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateAddressCommandInput extends AssociateAddressRequest {}
export interface AssociateAddressCommandOutput
  extends AssociateAddressResult,
    __MetadataBearer {}
declare const AssociateAddressCommand_base: {
  new (
    input: AssociateAddressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateAddressCommandInput,
    AssociateAddressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [AssociateAddressCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateAddressCommandInput,
    AssociateAddressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateAddressCommand extends AssociateAddressCommand_base {
  protected static __types: {
    api: {
      input: AssociateAddressRequest;
      output: AssociateAddressResult;
    };
    sdk: {
      input: AssociateAddressCommandInput;
      output: AssociateAddressCommandOutput;
    };
  };
}
