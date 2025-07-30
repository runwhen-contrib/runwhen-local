import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  FailoverDBClusterMessage,
  FailoverDBClusterResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface FailoverDBClusterCommandInput
  extends FailoverDBClusterMessage {}
export interface FailoverDBClusterCommandOutput
  extends FailoverDBClusterResult,
    __MetadataBearer {}
declare const FailoverDBClusterCommand_base: {
  new (
    input: FailoverDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    FailoverDBClusterCommandInput,
    FailoverDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: FailoverDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    FailoverDBClusterCommandInput,
    FailoverDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class FailoverDBClusterCommand extends FailoverDBClusterCommand_base {
  protected static __types: {
    api: {
      input: FailoverDBClusterMessage;
      output: FailoverDBClusterResult;
    };
    sdk: {
      input: FailoverDBClusterCommandInput;
      output: FailoverDBClusterCommandOutput;
    };
  };
}
