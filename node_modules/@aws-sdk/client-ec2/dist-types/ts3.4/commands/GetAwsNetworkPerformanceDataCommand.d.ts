import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetAwsNetworkPerformanceDataRequest,
  GetAwsNetworkPerformanceDataResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetAwsNetworkPerformanceDataCommandInput
  extends GetAwsNetworkPerformanceDataRequest {}
export interface GetAwsNetworkPerformanceDataCommandOutput
  extends GetAwsNetworkPerformanceDataResult,
    __MetadataBearer {}
declare const GetAwsNetworkPerformanceDataCommand_base: {
  new (
    input: GetAwsNetworkPerformanceDataCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetAwsNetworkPerformanceDataCommandInput,
    GetAwsNetworkPerformanceDataCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [GetAwsNetworkPerformanceDataCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    GetAwsNetworkPerformanceDataCommandInput,
    GetAwsNetworkPerformanceDataCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetAwsNetworkPerformanceDataCommand extends GetAwsNetworkPerformanceDataCommand_base {
  protected static __types: {
    api: {
      input: GetAwsNetworkPerformanceDataRequest;
      output: GetAwsNetworkPerformanceDataResult;
    };
    sdk: {
      input: GetAwsNetworkPerformanceDataCommandInput;
      output: GetAwsNetworkPerformanceDataCommandOutput;
    };
  };
}
