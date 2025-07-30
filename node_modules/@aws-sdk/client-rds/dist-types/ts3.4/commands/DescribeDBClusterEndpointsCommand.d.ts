import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBClusterEndpointMessage,
  DescribeDBClusterEndpointsMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBClusterEndpointsCommandInput
  extends DescribeDBClusterEndpointsMessage {}
export interface DescribeDBClusterEndpointsCommandOutput
  extends DBClusterEndpointMessage,
    __MetadataBearer {}
declare const DescribeDBClusterEndpointsCommand_base: {
  new (
    input: DescribeDBClusterEndpointsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClusterEndpointsCommandInput,
    DescribeDBClusterEndpointsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBClusterEndpointsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClusterEndpointsCommandInput,
    DescribeDBClusterEndpointsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBClusterEndpointsCommand extends DescribeDBClusterEndpointsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBClusterEndpointsMessage;
      output: DBClusterEndpointMessage;
    };
    sdk: {
      input: DescribeDBClusterEndpointsCommandInput;
      output: DescribeDBClusterEndpointsCommandOutput;
    };
  };
}
