import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { ListTagsForResourceMessage, TagListMessage } from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ListTagsForResourceCommandInput
  extends ListTagsForResourceMessage {}
export interface ListTagsForResourceCommandOutput
  extends TagListMessage,
    __MetadataBearer {}
declare const ListTagsForResourceCommand_base: {
  new (
    input: ListTagsForResourceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ListTagsForResourceCommandInput,
    ListTagsForResourceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ListTagsForResourceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ListTagsForResourceCommandInput,
    ListTagsForResourceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ListTagsForResourceCommand extends ListTagsForResourceCommand_base {
  protected static __types: {
    api: {
      input: ListTagsForResourceMessage;
      output: TagListMessage;
    };
    sdk: {
      input: ListTagsForResourceCommandInput;
      output: ListTagsForResourceCommandOutput;
    };
  };
}
