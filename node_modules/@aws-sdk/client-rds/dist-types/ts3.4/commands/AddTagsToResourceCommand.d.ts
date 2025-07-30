import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { AddTagsToResourceMessage } from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface AddTagsToResourceCommandInput
  extends AddTagsToResourceMessage {}
export interface AddTagsToResourceCommandOutput extends __MetadataBearer {}
declare const AddTagsToResourceCommand_base: {
  new (
    input: AddTagsToResourceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AddTagsToResourceCommandInput,
    AddTagsToResourceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AddTagsToResourceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AddTagsToResourceCommandInput,
    AddTagsToResourceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AddTagsToResourceCommand extends AddTagsToResourceCommand_base {
  protected static __types: {
    api: {
      input: AddTagsToResourceMessage;
      output: {};
    };
    sdk: {
      input: AddTagsToResourceCommandInput;
      output: AddTagsToResourceCommandOutput;
    };
  };
}
