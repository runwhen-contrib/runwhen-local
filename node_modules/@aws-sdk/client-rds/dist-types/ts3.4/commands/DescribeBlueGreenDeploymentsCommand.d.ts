import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeBlueGreenDeploymentsRequest,
  DescribeBlueGreenDeploymentsResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeBlueGreenDeploymentsCommandInput
  extends DescribeBlueGreenDeploymentsRequest {}
export interface DescribeBlueGreenDeploymentsCommandOutput
  extends DescribeBlueGreenDeploymentsResponse,
    __MetadataBearer {}
declare const DescribeBlueGreenDeploymentsCommand_base: {
  new (
    input: DescribeBlueGreenDeploymentsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeBlueGreenDeploymentsCommandInput,
    DescribeBlueGreenDeploymentsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeBlueGreenDeploymentsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeBlueGreenDeploymentsCommandInput,
    DescribeBlueGreenDeploymentsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeBlueGreenDeploymentsCommand extends DescribeBlueGreenDeploymentsCommand_base {
  protected static __types: {
    api: {
      input: DescribeBlueGreenDeploymentsRequest;
      output: DescribeBlueGreenDeploymentsResponse;
    };
    sdk: {
      input: DescribeBlueGreenDeploymentsCommandInput;
      output: DescribeBlueGreenDeploymentsCommandOutput;
    };
  };
}
