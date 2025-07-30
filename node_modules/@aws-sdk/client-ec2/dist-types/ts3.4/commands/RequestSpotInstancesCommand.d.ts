import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  RequestSpotInstancesRequest,
  RequestSpotInstancesResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface RequestSpotInstancesCommandInput
  extends RequestSpotInstancesRequest {}
export interface RequestSpotInstancesCommandOutput
  extends RequestSpotInstancesResult,
    __MetadataBearer {}
declare const RequestSpotInstancesCommand_base: {
  new (
    input: RequestSpotInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RequestSpotInstancesCommandInput,
    RequestSpotInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [RequestSpotInstancesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    RequestSpotInstancesCommandInput,
    RequestSpotInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RequestSpotInstancesCommand extends RequestSpotInstancesCommand_base {
  protected static __types: {
    api: {
      input: RequestSpotInstancesRequest;
      output: RequestSpotInstancesResult;
    };
    sdk: {
      input: RequestSpotInstancesCommandInput;
      output: RequestSpotInstancesCommandOutput;
    };
  };
}
