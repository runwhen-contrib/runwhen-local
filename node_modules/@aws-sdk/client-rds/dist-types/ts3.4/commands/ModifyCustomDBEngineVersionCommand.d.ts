import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DBEngineVersion } from "../models/models_0";
import { ModifyCustomDBEngineVersionMessage } from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyCustomDBEngineVersionCommandInput
  extends ModifyCustomDBEngineVersionMessage {}
export interface ModifyCustomDBEngineVersionCommandOutput
  extends DBEngineVersion,
    __MetadataBearer {}
declare const ModifyCustomDBEngineVersionCommand_base: {
  new (
    input: ModifyCustomDBEngineVersionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyCustomDBEngineVersionCommandInput,
    ModifyCustomDBEngineVersionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyCustomDBEngineVersionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyCustomDBEngineVersionCommandInput,
    ModifyCustomDBEngineVersionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyCustomDBEngineVersionCommand extends ModifyCustomDBEngineVersionCommand_base {
  protected static __types: {
    api: {
      input: ModifyCustomDBEngineVersionMessage;
      output: DBEngineVersion;
    };
    sdk: {
      input: ModifyCustomDBEngineVersionCommandInput;
      output: ModifyCustomDBEngineVersionCommandOutput;
    };
  };
}
