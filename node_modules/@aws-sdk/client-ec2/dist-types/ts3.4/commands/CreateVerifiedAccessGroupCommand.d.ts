import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateVerifiedAccessGroupRequest,
  CreateVerifiedAccessGroupResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateVerifiedAccessGroupCommandInput
  extends CreateVerifiedAccessGroupRequest {}
export interface CreateVerifiedAccessGroupCommandOutput
  extends CreateVerifiedAccessGroupResult,
    __MetadataBearer {}
declare const CreateVerifiedAccessGroupCommand_base: {
  new (
    input: CreateVerifiedAccessGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVerifiedAccessGroupCommandInput,
    CreateVerifiedAccessGroupCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateVerifiedAccessGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVerifiedAccessGroupCommandInput,
    CreateVerifiedAccessGroupCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateVerifiedAccessGroupCommand extends CreateVerifiedAccessGroupCommand_base {
  protected static __types: {
    api: {
      input: CreateVerifiedAccessGroupRequest;
      output: CreateVerifiedAccessGroupResult;
    };
    sdk: {
      input: CreateVerifiedAccessGroupCommandInput;
      output: CreateVerifiedAccessGroupCommandOutput;
    };
  };
}
