import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreatePlacementGroupRequest,
  CreatePlacementGroupResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreatePlacementGroupCommandInput
  extends CreatePlacementGroupRequest {}
export interface CreatePlacementGroupCommandOutput
  extends CreatePlacementGroupResult,
    __MetadataBearer {}
declare const CreatePlacementGroupCommand_base: {
  new (
    input: CreatePlacementGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreatePlacementGroupCommandInput,
    CreatePlacementGroupCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CreatePlacementGroupCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CreatePlacementGroupCommandInput,
    CreatePlacementGroupCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreatePlacementGroupCommand extends CreatePlacementGroupCommand_base {
  protected static __types: {
    api: {
      input: CreatePlacementGroupRequest;
      output: CreatePlacementGroupResult;
    };
    sdk: {
      input: CreatePlacementGroupCommandInput;
      output: CreatePlacementGroupCommandOutput;
    };
  };
}
