import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeDBProxyTargetsRequest,
  DescribeDBProxyTargetsResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBProxyTargetsCommandInput
  extends DescribeDBProxyTargetsRequest {}
export interface DescribeDBProxyTargetsCommandOutput
  extends DescribeDBProxyTargetsResponse,
    __MetadataBearer {}
declare const DescribeDBProxyTargetsCommand_base: {
  new (
    input: DescribeDBProxyTargetsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBProxyTargetsCommandInput,
    DescribeDBProxyTargetsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeDBProxyTargetsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBProxyTargetsCommandInput,
    DescribeDBProxyTargetsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBProxyTargetsCommand extends DescribeDBProxyTargetsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBProxyTargetsRequest;
      output: DescribeDBProxyTargetsResponse;
    };
    sdk: {
      input: DescribeDBProxyTargetsCommandInput;
      output: DescribeDBProxyTargetsCommandOutput;
    };
  };
}
