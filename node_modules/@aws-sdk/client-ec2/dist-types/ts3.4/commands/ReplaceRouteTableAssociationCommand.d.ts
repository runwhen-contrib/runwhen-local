import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ReplaceRouteTableAssociationRequest,
  ReplaceRouteTableAssociationResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ReplaceRouteTableAssociationCommandInput
  extends ReplaceRouteTableAssociationRequest {}
export interface ReplaceRouteTableAssociationCommandOutput
  extends ReplaceRouteTableAssociationResult,
    __MetadataBearer {}
declare const ReplaceRouteTableAssociationCommand_base: {
  new (
    input: ReplaceRouteTableAssociationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceRouteTableAssociationCommandInput,
    ReplaceRouteTableAssociationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ReplaceRouteTableAssociationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceRouteTableAssociationCommandInput,
    ReplaceRouteTableAssociationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ReplaceRouteTableAssociationCommand extends ReplaceRouteTableAssociationCommand_base {
  protected static __types: {
    api: {
      input: ReplaceRouteTableAssociationRequest;
      output: ReplaceRouteTableAssociationResult;
    };
    sdk: {
      input: ReplaceRouteTableAssociationCommandInput;
      output: ReplaceRouteTableAssociationCommandOutput;
    };
  };
}
