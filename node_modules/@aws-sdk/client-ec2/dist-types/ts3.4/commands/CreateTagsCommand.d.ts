import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { CreateTagsRequest } from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTagsCommandInput extends CreateTagsRequest {}
export interface CreateTagsCommandOutput extends __MetadataBearer {}
declare const CreateTagsCommand_base: {
  new (
    input: CreateTagsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTagsCommandInput,
    CreateTagsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateTagsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTagsCommandInput,
    CreateTagsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTagsCommand extends CreateTagsCommand_base {
  protected static __types: {
    api: {
      input: CreateTagsRequest;
      output: {};
    };
    sdk: {
      input: CreateTagsCommandInput;
      output: CreateTagsCommandOutput;
    };
  };
}
