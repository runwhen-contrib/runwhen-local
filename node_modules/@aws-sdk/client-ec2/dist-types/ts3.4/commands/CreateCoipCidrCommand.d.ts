import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateCoipCidrRequest,
  CreateCoipCidrResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateCoipCidrCommandInput extends CreateCoipCidrRequest {}
export interface CreateCoipCidrCommandOutput
  extends CreateCoipCidrResult,
    __MetadataBearer {}
declare const CreateCoipCidrCommand_base: {
  new (
    input: CreateCoipCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateCoipCidrCommandInput,
    CreateCoipCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateCoipCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateCoipCidrCommandInput,
    CreateCoipCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateCoipCidrCommand extends CreateCoipCidrCommand_base {
  protected static __types: {
    api: {
      input: CreateCoipCidrRequest;
      output: CreateCoipCidrResult;
    };
    sdk: {
      input: CreateCoipCidrCommandInput;
      output: CreateCoipCidrCommandOutput;
    };
  };
}
