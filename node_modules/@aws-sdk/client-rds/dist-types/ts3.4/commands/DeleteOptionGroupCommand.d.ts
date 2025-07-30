import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DeleteOptionGroupMessage } from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteOptionGroupCommandInput
  extends DeleteOptionGroupMessage {}
export interface DeleteOptionGroupCommandOutput extends __MetadataBearer {}
declare const DeleteOptionGroupCommand_base: {
  new (
    input: DeleteOptionGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteOptionGroupCommandInput,
    DeleteOptionGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteOptionGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteOptionGroupCommandInput,
    DeleteOptionGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteOptionGroupCommand extends DeleteOptionGroupCommand_base {
  protected static __types: {
    api: {
      input: DeleteOptionGroupMessage;
      output: {};
    };
    sdk: {
      input: DeleteOptionGroupCommandInput;
      output: DeleteOptionGroupCommandOutput;
    };
  };
}
