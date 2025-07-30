import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { RemoveTagsFromResourceMessage } from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RemoveTagsFromResourceCommandInput
  extends RemoveTagsFromResourceMessage {}
export interface RemoveTagsFromResourceCommandOutput extends __MetadataBearer {}
declare const RemoveTagsFromResourceCommand_base: {
  new (
    input: RemoveTagsFromResourceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RemoveTagsFromResourceCommandInput,
    RemoveTagsFromResourceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RemoveTagsFromResourceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RemoveTagsFromResourceCommandInput,
    RemoveTagsFromResourceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RemoveTagsFromResourceCommand extends RemoveTagsFromResourceCommand_base {
  protected static __types: {
    api: {
      input: RemoveTagsFromResourceMessage;
      output: {};
    };
    sdk: {
      input: RemoveTagsFromResourceCommandInput;
      output: RemoveTagsFromResourceCommandOutput;
    };
  };
}
