import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateRouteTableRequest,
  AssociateRouteTableResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateRouteTableCommandInput
  extends AssociateRouteTableRequest {}
export interface AssociateRouteTableCommandOutput
  extends AssociateRouteTableResult,
    __MetadataBearer {}
declare const AssociateRouteTableCommand_base: {
  new (
    input: AssociateRouteTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateRouteTableCommandInput,
    AssociateRouteTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateRouteTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateRouteTableCommandInput,
    AssociateRouteTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateRouteTableCommand extends AssociateRouteTableCommand_base {
  protected static __types: {
    api: {
      input: AssociateRouteTableRequest;
      output: AssociateRouteTableResult;
    };
    sdk: {
      input: AssociateRouteTableCommandInput;
      output: AssociateRouteTableCommandOutput;
    };
  };
}
