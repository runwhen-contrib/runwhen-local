import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  FailoverGlobalClusterMessage,
  FailoverGlobalClusterResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface FailoverGlobalClusterCommandInput
  extends FailoverGlobalClusterMessage {}
export interface FailoverGlobalClusterCommandOutput
  extends FailoverGlobalClusterResult,
    __MetadataBearer {}
declare const FailoverGlobalClusterCommand_base: {
  new (
    input: FailoverGlobalClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    FailoverGlobalClusterCommandInput,
    FailoverGlobalClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: FailoverGlobalClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    FailoverGlobalClusterCommandInput,
    FailoverGlobalClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class FailoverGlobalClusterCommand extends FailoverGlobalClusterCommand_base {
  protected static __types: {
    api: {
      input: FailoverGlobalClusterMessage;
      output: FailoverGlobalClusterResult;
    };
    sdk: {
      input: FailoverGlobalClusterCommandInput;
      output: FailoverGlobalClusterCommandOutput;
    };
  };
}
