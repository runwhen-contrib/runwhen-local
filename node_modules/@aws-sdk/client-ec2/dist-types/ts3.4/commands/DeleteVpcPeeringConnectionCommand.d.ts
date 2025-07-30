import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteVpcPeeringConnectionRequest,
  DeleteVpcPeeringConnectionResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteVpcPeeringConnectionCommandInput
  extends DeleteVpcPeeringConnectionRequest {}
export interface DeleteVpcPeeringConnectionCommandOutput
  extends DeleteVpcPeeringConnectionResult,
    __MetadataBearer {}
declare const DeleteVpcPeeringConnectionCommand_base: {
  new (
    input: DeleteVpcPeeringConnectionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpcPeeringConnectionCommandInput,
    DeleteVpcPeeringConnectionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteVpcPeeringConnectionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpcPeeringConnectionCommandInput,
    DeleteVpcPeeringConnectionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteVpcPeeringConnectionCommand extends DeleteVpcPeeringConnectionCommand_base {
  protected static __types: {
    api: {
      input: DeleteVpcPeeringConnectionRequest;
      output: DeleteVpcPeeringConnectionResult;
    };
    sdk: {
      input: DeleteVpcPeeringConnectionCommandInput;
      output: DeleteVpcPeeringConnectionCommandOutput;
    };
  };
}
