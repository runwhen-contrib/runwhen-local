import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBClusterMessage,
  DescribeDBClustersMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBClustersCommandInput
  extends DescribeDBClustersMessage {}
export interface DescribeDBClustersCommandOutput
  extends DBClusterMessage,
    __MetadataBearer {}
declare const DescribeDBClustersCommand_base: {
  new (
    input: DescribeDBClustersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClustersCommandInput,
    DescribeDBClustersCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBClustersCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClustersCommandInput,
    DescribeDBClustersCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBClustersCommand extends DescribeDBClustersCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBClustersMessage;
      output: DBClusterMessage;
    };
    sdk: {
      input: DescribeDBClustersCommandInput;
      output: DescribeDBClustersCommandOutput;
    };
  };
}
