import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteVpcRequest } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteVpcCommandInput extends DeleteVpcRequest {}
export interface DeleteVpcCommandOutput extends __MetadataBearer {}
declare const DeleteVpcCommand_base: {
  new (
    input: DeleteVpcCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpcCommandInput,
    DeleteVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteVpcCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpcCommandInput,
    DeleteVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteVpcCommand extends DeleteVpcCommand_base {
  protected static __types: {
    api: {
      input: DeleteVpcRequest;
      output: {};
    };
    sdk: {
      input: DeleteVpcCommandInput;
      output: DeleteVpcCommandOutput;
    };
  };
}
