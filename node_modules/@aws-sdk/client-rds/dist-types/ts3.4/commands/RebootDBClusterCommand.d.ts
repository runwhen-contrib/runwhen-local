import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  RebootDBClusterMessage,
  RebootDBClusterResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RebootDBClusterCommandInput extends RebootDBClusterMessage {}
export interface RebootDBClusterCommandOutput
  extends RebootDBClusterResult,
    __MetadataBearer {}
declare const RebootDBClusterCommand_base: {
  new (
    input: RebootDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RebootDBClusterCommandInput,
    RebootDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RebootDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RebootDBClusterCommandInput,
    RebootDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RebootDBClusterCommand extends RebootDBClusterCommand_base {
  protected static __types: {
    api: {
      input: RebootDBClusterMessage;
      output: RebootDBClusterResult;
    };
    sdk: {
      input: RebootDBClusterCommandInput;
      output: RebootDBClusterCommandOutput;
    };
  };
}
