import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteTagsRequest } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteTagsCommandInput extends DeleteTagsRequest {}
export interface DeleteTagsCommandOutput extends __MetadataBearer {}
declare const DeleteTagsCommand_base: {
  new (
    input: DeleteTagsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTagsCommandInput,
    DeleteTagsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTagsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTagsCommandInput,
    DeleteTagsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTagsCommand extends DeleteTagsCommand_base {
  protected static __types: {
    api: {
      input: DeleteTagsRequest;
      output: {};
    };
    sdk: {
      input: DeleteTagsCommandInput;
      output: DeleteTagsCommandOutput;
    };
  };
}
