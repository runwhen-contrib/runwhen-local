import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  RejectVpcPeeringConnectionRequest,
  RejectVpcPeeringConnectionResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface RejectVpcPeeringConnectionCommandInput
  extends RejectVpcPeeringConnectionRequest {}
export interface RejectVpcPeeringConnectionCommandOutput
  extends RejectVpcPeeringConnectionResult,
    __MetadataBearer {}
declare const RejectVpcPeeringConnectionCommand_base: {
  new (
    input: RejectVpcPeeringConnectionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RejectVpcPeeringConnectionCommandInput,
    RejectVpcPeeringConnectionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RejectVpcPeeringConnectionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RejectVpcPeeringConnectionCommandInput,
    RejectVpcPeeringConnectionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RejectVpcPeeringConnectionCommand extends RejectVpcPeeringConnectionCommand_base {
  protected static __types: {
    api: {
      input: RejectVpcPeeringConnectionRequest;
      output: RejectVpcPeeringConnectionResult;
    };
    sdk: {
      input: RejectVpcPeeringConnectionCommandInput;
      output: RejectVpcPeeringConnectionCommandOutput;
    };
  };
}
