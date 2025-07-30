import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateVpcCidrBlockRequest,
  AssociateVpcCidrBlockResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateVpcCidrBlockCommandInput
  extends AssociateVpcCidrBlockRequest {}
export interface AssociateVpcCidrBlockCommandOutput
  extends AssociateVpcCidrBlockResult,
    __MetadataBearer {}
declare const AssociateVpcCidrBlockCommand_base: {
  new (
    input: AssociateVpcCidrBlockCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateVpcCidrBlockCommandInput,
    AssociateVpcCidrBlockCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateVpcCidrBlockCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateVpcCidrBlockCommandInput,
    AssociateVpcCidrBlockCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateVpcCidrBlockCommand extends AssociateVpcCidrBlockCommand_base {
  protected static __types: {
    api: {
      input: AssociateVpcCidrBlockRequest;
      output: AssociateVpcCidrBlockResult;
    };
    sdk: {
      input: AssociateVpcCidrBlockCommandInput;
      output: AssociateVpcCidrBlockCommandOutput;
    };
  };
}
