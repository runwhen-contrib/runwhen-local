import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeGlobalClustersMessage,
  GlobalClustersMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeGlobalClustersCommandInput
  extends DescribeGlobalClustersMessage {}
export interface DescribeGlobalClustersCommandOutput
  extends GlobalClustersMessage,
    __MetadataBearer {}
declare const DescribeGlobalClustersCommand_base: {
  new (
    input: DescribeGlobalClustersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeGlobalClustersCommandInput,
    DescribeGlobalClustersCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeGlobalClustersCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeGlobalClustersCommandInput,
    DescribeGlobalClustersCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeGlobalClustersCommand extends DescribeGlobalClustersCommand_base {
  protected static __types: {
    api: {
      input: DescribeGlobalClustersMessage;
      output: GlobalClustersMessage;
    };
    sdk: {
      input: DescribeGlobalClustersCommandInput;
      output: DescribeGlobalClustersCommandOutput;
    };
  };
}
