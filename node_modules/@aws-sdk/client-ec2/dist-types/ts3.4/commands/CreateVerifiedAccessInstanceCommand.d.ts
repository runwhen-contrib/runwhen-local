import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateVerifiedAccessInstanceRequest,
  CreateVerifiedAccessInstanceResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateVerifiedAccessInstanceCommandInput
  extends CreateVerifiedAccessInstanceRequest {}
export interface CreateVerifiedAccessInstanceCommandOutput
  extends CreateVerifiedAccessInstanceResult,
    __MetadataBearer {}
declare const CreateVerifiedAccessInstanceCommand_base: {
  new (
    input: CreateVerifiedAccessInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVerifiedAccessInstanceCommandInput,
    CreateVerifiedAccessInstanceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CreateVerifiedAccessInstanceCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVerifiedAccessInstanceCommandInput,
    CreateVerifiedAccessInstanceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateVerifiedAccessInstanceCommand extends CreateVerifiedAccessInstanceCommand_base {
  protected static __types: {
    api: {
      input: CreateVerifiedAccessInstanceRequest;
      output: CreateVerifiedAccessInstanceResult;
    };
    sdk: {
      input: CreateVerifiedAccessInstanceCommandInput;
      output: CreateVerifiedAccessInstanceCommandOutput;
    };
  };
}
