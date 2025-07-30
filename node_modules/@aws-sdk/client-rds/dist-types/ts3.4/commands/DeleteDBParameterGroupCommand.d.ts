import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DeleteDBParameterGroupMessage } from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteDBParameterGroupCommandInput
  extends DeleteDBParameterGroupMessage {}
export interface DeleteDBParameterGroupCommandOutput extends __MetadataBearer {}
declare const DeleteDBParameterGroupCommand_base: {
  new (
    input: DeleteDBParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBParameterGroupCommandInput,
    DeleteDBParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteDBParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBParameterGroupCommandInput,
    DeleteDBParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteDBParameterGroupCommand extends DeleteDBParameterGroupCommand_base {
  protected static __types: {
    api: {
      input: DeleteDBParameterGroupMessage;
      output: {};
    };
    sdk: {
      input: DeleteDBParameterGroupCommandInput;
      output: DeleteDBParameterGroupCommandOutput;
    };
  };
}
