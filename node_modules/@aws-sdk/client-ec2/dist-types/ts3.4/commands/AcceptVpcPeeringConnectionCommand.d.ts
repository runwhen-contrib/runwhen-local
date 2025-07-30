import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AcceptVpcPeeringConnectionRequest,
  AcceptVpcPeeringConnectionResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AcceptVpcPeeringConnectionCommandInput
  extends AcceptVpcPeeringConnectionRequest {}
export interface AcceptVpcPeeringConnectionCommandOutput
  extends AcceptVpcPeeringConnectionResult,
    __MetadataBearer {}
declare const AcceptVpcPeeringConnectionCommand_base: {
  new (
    input: AcceptVpcPeeringConnectionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptVpcPeeringConnectionCommandInput,
    AcceptVpcPeeringConnectionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AcceptVpcPeeringConnectionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptVpcPeeringConnectionCommandInput,
    AcceptVpcPeeringConnectionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AcceptVpcPeeringConnectionCommand extends AcceptVpcPeeringConnectionCommand_base {
  protected static __types: {
    api: {
      input: AcceptVpcPeeringConnectionRequest;
      output: AcceptVpcPeeringConnectionResult;
    };
    sdk: {
      input: AcceptVpcPeeringConnectionCommandInput;
      output: AcceptVpcPeeringConnectionCommandOutput;
    };
  };
}
