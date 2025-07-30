import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CopyDBParameterGroupMessage,
  CopyDBParameterGroupResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CopyDBParameterGroupCommandInput
  extends CopyDBParameterGroupMessage {}
export interface CopyDBParameterGroupCommandOutput
  extends CopyDBParameterGroupResult,
    __MetadataBearer {}
declare const CopyDBParameterGroupCommand_base: {
  new (
    input: CopyDBParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CopyDBParameterGroupCommandInput,
    CopyDBParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CopyDBParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CopyDBParameterGroupCommandInput,
    CopyDBParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CopyDBParameterGroupCommand extends CopyDBParameterGroupCommand_base {
  protected static __types: {
    api: {
      input: CopyDBParameterGroupMessage;
      output: CopyDBParameterGroupResult;
    };
    sdk: {
      input: CopyDBParameterGroupCommandInput;
      output: CopyDBParameterGroupCommandOutput;
    };
  };
}
