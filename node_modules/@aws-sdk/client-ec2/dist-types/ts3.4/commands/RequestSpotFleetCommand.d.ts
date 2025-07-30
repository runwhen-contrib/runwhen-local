import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  RequestSpotFleetRequest,
  RequestSpotFleetResponse,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface RequestSpotFleetCommandInput extends RequestSpotFleetRequest {}
export interface RequestSpotFleetCommandOutput
  extends RequestSpotFleetResponse,
    __MetadataBearer {}
declare const RequestSpotFleetCommand_base: {
  new (
    input: RequestSpotFleetCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RequestSpotFleetCommandInput,
    RequestSpotFleetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RequestSpotFleetCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RequestSpotFleetCommandInput,
    RequestSpotFleetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RequestSpotFleetCommand extends RequestSpotFleetCommand_base {
  protected static __types: {
    api: {
      input: RequestSpotFleetRequest;
      output: RequestSpotFleetResponse;
    };
    sdk: {
      input: RequestSpotFleetCommandInput;
      output: RequestSpotFleetCommandOutput;
    };
  };
}
