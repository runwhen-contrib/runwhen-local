import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeDBProxyTargetGroupsRequest,
  DescribeDBProxyTargetGroupsResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBProxyTargetGroupsCommandInput
  extends DescribeDBProxyTargetGroupsRequest {}
export interface DescribeDBProxyTargetGroupsCommandOutput
  extends DescribeDBProxyTargetGroupsResponse,
    __MetadataBearer {}
declare const DescribeDBProxyTargetGroupsCommand_base: {
  new (
    input: DescribeDBProxyTargetGroupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBProxyTargetGroupsCommandInput,
    DescribeDBProxyTargetGroupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeDBProxyTargetGroupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBProxyTargetGroupsCommandInput,
    DescribeDBProxyTargetGroupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBProxyTargetGroupsCommand extends DescribeDBProxyTargetGroupsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBProxyTargetGroupsRequest;
      output: DescribeDBProxyTargetGroupsResponse;
    };
    sdk: {
      input: DescribeDBProxyTargetGroupsCommandInput;
      output: DescribeDBProxyTargetGroupsCommandOutput;
    };
  };
}
