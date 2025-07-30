import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeDBProxyEndpointsRequest,
  DescribeDBProxyEndpointsResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBProxyEndpointsCommandInput
  extends DescribeDBProxyEndpointsRequest {}
export interface DescribeDBProxyEndpointsCommandOutput
  extends DescribeDBProxyEndpointsResponse,
    __MetadataBearer {}
declare const DescribeDBProxyEndpointsCommand_base: {
  new (
    input: DescribeDBProxyEndpointsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBProxyEndpointsCommandInput,
    DescribeDBProxyEndpointsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBProxyEndpointsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBProxyEndpointsCommandInput,
    DescribeDBProxyEndpointsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBProxyEndpointsCommand extends DescribeDBProxyEndpointsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBProxyEndpointsRequest;
      output: DescribeDBProxyEndpointsResponse;
    };
    sdk: {
      input: DescribeDBProxyEndpointsCommandInput;
      output: DescribeDBProxyEndpointsCommandOutput;
    };
  };
}
