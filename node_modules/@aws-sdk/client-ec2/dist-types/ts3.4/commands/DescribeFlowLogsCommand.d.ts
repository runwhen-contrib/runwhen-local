import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeFlowLogsRequest,
  DescribeFlowLogsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeFlowLogsCommandInput extends DescribeFlowLogsRequest {}
export interface DescribeFlowLogsCommandOutput
  extends DescribeFlowLogsResult,
    __MetadataBearer {}
declare const DescribeFlowLogsCommand_base: {
  new (
    input: DescribeFlowLogsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeFlowLogsCommandInput,
    DescribeFlowLogsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeFlowLogsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeFlowLogsCommandInput,
    DescribeFlowLogsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeFlowLogsCommand extends DescribeFlowLogsCommand_base {
  protected static __types: {
    api: {
      input: DescribeFlowLogsRequest;
      output: DescribeFlowLogsResult;
    };
    sdk: {
      input: DescribeFlowLogsCommandInput;
      output: DescribeFlowLogsCommandOutput;
    };
  };
}
