import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CopyDBClusterParameterGroupMessage,
  CopyDBClusterParameterGroupResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CopyDBClusterParameterGroupCommandInput
  extends CopyDBClusterParameterGroupMessage {}
export interface CopyDBClusterParameterGroupCommandOutput
  extends CopyDBClusterParameterGroupResult,
    __MetadataBearer {}
declare const CopyDBClusterParameterGroupCommand_base: {
  new (
    input: CopyDBClusterParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CopyDBClusterParameterGroupCommandInput,
    CopyDBClusterParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CopyDBClusterParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CopyDBClusterParameterGroupCommandInput,
    CopyDBClusterParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CopyDBClusterParameterGroupCommand extends CopyDBClusterParameterGroupCommand_base {
  protected static __types: {
    api: {
      input: CopyDBClusterParameterGroupMessage;
      output: CopyDBClusterParameterGroupResult;
    };
    sdk: {
      input: CopyDBClusterParameterGroupCommandInput;
      output: CopyDBClusterParameterGroupCommandOutput;
    };
  };
}
