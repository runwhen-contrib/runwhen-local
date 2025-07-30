import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateCustomDBEngineVersionMessage,
  DBEngineVersion,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateCustomDBEngineVersionCommandInput
  extends CreateCustomDBEngineVersionMessage {}
export interface CreateCustomDBEngineVersionCommandOutput
  extends DBEngineVersion,
    __MetadataBearer {}
declare const CreateCustomDBEngineVersionCommand_base: {
  new (
    input: CreateCustomDBEngineVersionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateCustomDBEngineVersionCommandInput,
    CreateCustomDBEngineVersionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateCustomDBEngineVersionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateCustomDBEngineVersionCommandInput,
    CreateCustomDBEngineVersionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateCustomDBEngineVersionCommand extends CreateCustomDBEngineVersionCommand_base {
  protected static __types: {
    api: {
      input: CreateCustomDBEngineVersionMessage;
      output: DBEngineVersion;
    };
    sdk: {
      input: CreateCustomDBEngineVersionCommandInput;
      output: CreateCustomDBEngineVersionCommandOutput;
    };
  };
}
