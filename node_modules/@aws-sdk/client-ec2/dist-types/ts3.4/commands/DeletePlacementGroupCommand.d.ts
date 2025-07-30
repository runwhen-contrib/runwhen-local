import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeletePlacementGroupRequest } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeletePlacementGroupCommandInput
  extends DeletePlacementGroupRequest {}
export interface DeletePlacementGroupCommandOutput extends __MetadataBearer {}
declare const DeletePlacementGroupCommand_base: {
  new (
    input: DeletePlacementGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeletePlacementGroupCommandInput,
    DeletePlacementGroupCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeletePlacementGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeletePlacementGroupCommandInput,
    DeletePlacementGroupCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeletePlacementGroupCommand extends DeletePlacementGroupCommand_base {
  protected static __types: {
    api: {
      input: DeletePlacementGroupRequest;
      output: {};
    };
    sdk: {
      input: DeletePlacementGroupCommandInput;
      output: DeletePlacementGroupCommandOutput;
    };
  };
}
