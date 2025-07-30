import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateSubnetCidrBlockRequest,
  AssociateSubnetCidrBlockResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateSubnetCidrBlockCommandInput
  extends AssociateSubnetCidrBlockRequest {}
export interface AssociateSubnetCidrBlockCommandOutput
  extends AssociateSubnetCidrBlockResult,
    __MetadataBearer {}
declare const AssociateSubnetCidrBlockCommand_base: {
  new (
    input: AssociateSubnetCidrBlockCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateSubnetCidrBlockCommandInput,
    AssociateSubnetCidrBlockCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateSubnetCidrBlockCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateSubnetCidrBlockCommandInput,
    AssociateSubnetCidrBlockCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateSubnetCidrBlockCommand extends AssociateSubnetCidrBlockCommand_base {
  protected static __types: {
    api: {
      input: AssociateSubnetCidrBlockRequest;
      output: AssociateSubnetCidrBlockResult;
    };
    sdk: {
      input: AssociateSubnetCidrBlockCommandInput;
      output: AssociateSubnetCidrBlockCommandOutput;
    };
  };
}
