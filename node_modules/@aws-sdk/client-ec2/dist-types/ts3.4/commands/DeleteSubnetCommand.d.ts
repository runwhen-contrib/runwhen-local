import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteSubnetRequest } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteSubnetCommandInput extends DeleteSubnetRequest {}
export interface DeleteSubnetCommandOutput extends __MetadataBearer {}
declare const DeleteSubnetCommand_base: {
  new (
    input: DeleteSubnetCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteSubnetCommandInput,
    DeleteSubnetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteSubnetCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteSubnetCommandInput,
    DeleteSubnetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteSubnetCommand extends DeleteSubnetCommand_base {
  protected static __types: {
    api: {
      input: DeleteSubnetRequest;
      output: {};
    };
    sdk: {
      input: DeleteSubnetCommandInput;
      output: DeleteSubnetCommandOutput;
    };
  };
}
