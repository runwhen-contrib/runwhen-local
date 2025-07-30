import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeDBProxiesRequest,
  DescribeDBProxiesResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBProxiesCommandInput
  extends DescribeDBProxiesRequest {}
export interface DescribeDBProxiesCommandOutput
  extends DescribeDBProxiesResponse,
    __MetadataBearer {}
declare const DescribeDBProxiesCommand_base: {
  new (
    input: DescribeDBProxiesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBProxiesCommandInput,
    DescribeDBProxiesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBProxiesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBProxiesCommandInput,
    DescribeDBProxiesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBProxiesCommand extends DescribeDBProxiesCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBProxiesRequest;
      output: DescribeDBProxiesResponse;
    };
    sdk: {
      input: DescribeDBProxiesCommandInput;
      output: DescribeDBProxiesCommandOutput;
    };
  };
}
