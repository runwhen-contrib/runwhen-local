import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { CreateIpamRequest, CreateIpamResult } from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateIpamCommandInput extends CreateIpamRequest {}
export interface CreateIpamCommandOutput
  extends CreateIpamResult,
    __MetadataBearer {}
declare const CreateIpamCommand_base: {
  new (
    input: CreateIpamCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateIpamCommandInput,
    CreateIpamCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CreateIpamCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CreateIpamCommandInput,
    CreateIpamCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateIpamCommand extends CreateIpamCommand_base {
  protected static __types: {
    api: {
      input: CreateIpamRequest;
      output: CreateIpamResult;
    };
    sdk: {
      input: CreateIpamCommandInput;
      output: CreateIpamCommandOutput;
    };
  };
}
