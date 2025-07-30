import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBClusterBacktrackMessage,
  DescribeDBClusterBacktracksMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBClusterBacktracksCommandInput
  extends DescribeDBClusterBacktracksMessage {}
export interface DescribeDBClusterBacktracksCommandOutput
  extends DBClusterBacktrackMessage,
    __MetadataBearer {}
declare const DescribeDBClusterBacktracksCommand_base: {
  new (
    input: DescribeDBClusterBacktracksCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClusterBacktracksCommandInput,
    DescribeDBClusterBacktracksCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeDBClusterBacktracksCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClusterBacktracksCommandInput,
    DescribeDBClusterBacktracksCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBClusterBacktracksCommand extends DescribeDBClusterBacktracksCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBClusterBacktracksMessage;
      output: DBClusterBacktrackMessage;
    };
    sdk: {
      input: DescribeDBClusterBacktracksCommandInput;
      output: DescribeDBClusterBacktracksCommandOutput;
    };
  };
}
