import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateVpcPeeringConnectionRequest,
  CreateVpcPeeringConnectionResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateVpcPeeringConnectionCommandInput
  extends CreateVpcPeeringConnectionRequest {}
export interface CreateVpcPeeringConnectionCommandOutput
  extends CreateVpcPeeringConnectionResult,
    __MetadataBearer {}
declare const CreateVpcPeeringConnectionCommand_base: {
  new (
    input: CreateVpcPeeringConnectionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVpcPeeringConnectionCommandInput,
    CreateVpcPeeringConnectionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateVpcPeeringConnectionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVpcPeeringConnectionCommandInput,
    CreateVpcPeeringConnectionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateVpcPeeringConnectionCommand extends CreateVpcPeeringConnectionCommand_base {
  protected static __types: {
    api: {
      input: CreateVpcPeeringConnectionRequest;
      output: CreateVpcPeeringConnectionResult;
    };
    sdk: {
      input: CreateVpcPeeringConnectionCommandInput;
      output: CreateVpcPeeringConnectionCommandOutput;
    };
  };
}
