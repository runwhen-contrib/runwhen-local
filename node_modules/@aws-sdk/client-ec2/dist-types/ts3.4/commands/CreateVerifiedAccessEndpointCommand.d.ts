import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateVerifiedAccessEndpointRequest,
  CreateVerifiedAccessEndpointResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateVerifiedAccessEndpointCommandInput
  extends CreateVerifiedAccessEndpointRequest {}
export interface CreateVerifiedAccessEndpointCommandOutput
  extends CreateVerifiedAccessEndpointResult,
    __MetadataBearer {}
declare const CreateVerifiedAccessEndpointCommand_base: {
  new (
    input: CreateVerifiedAccessEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVerifiedAccessEndpointCommandInput,
    CreateVerifiedAccessEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateVerifiedAccessEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVerifiedAccessEndpointCommandInput,
    CreateVerifiedAccessEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateVerifiedAccessEndpointCommand extends CreateVerifiedAccessEndpointCommand_base {
  protected static __types: {
    api: {
      input: CreateVerifiedAccessEndpointRequest;
      output: CreateVerifiedAccessEndpointResult;
    };
    sdk: {
      input: CreateVerifiedAccessEndpointCommandInput;
      output: CreateVerifiedAccessEndpointCommandOutput;
    };
  };
}
