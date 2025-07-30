import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBEngineVersion,
  DeleteCustomDBEngineVersionMessage,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteCustomDBEngineVersionCommandInput
  extends DeleteCustomDBEngineVersionMessage {}
export interface DeleteCustomDBEngineVersionCommandOutput
  extends DBEngineVersion,
    __MetadataBearer {}
declare const DeleteCustomDBEngineVersionCommand_base: {
  new (
    input: DeleteCustomDBEngineVersionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteCustomDBEngineVersionCommandInput,
    DeleteCustomDBEngineVersionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteCustomDBEngineVersionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteCustomDBEngineVersionCommandInput,
    DeleteCustomDBEngineVersionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteCustomDBEngineVersionCommand extends DeleteCustomDBEngineVersionCommand_base {
  protected static __types: {
    api: {
      input: DeleteCustomDBEngineVersionMessage;
      output: DBEngineVersion;
    };
    sdk: {
      input: DeleteCustomDBEngineVersionCommandInput;
      output: DeleteCustomDBEngineVersionCommandOutput;
    };
  };
}
