import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CancelSpotFleetRequestsRequest,
  CancelSpotFleetRequestsResponse,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface CancelSpotFleetRequestsCommandInput
  extends CancelSpotFleetRequestsRequest {}
export interface CancelSpotFleetRequestsCommandOutput
  extends CancelSpotFleetRequestsResponse,
    __MetadataBearer {}
declare const CancelSpotFleetRequestsCommand_base: {
  new (
    input: CancelSpotFleetRequestsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelSpotFleetRequestsCommandInput,
    CancelSpotFleetRequestsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CancelSpotFleetRequestsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelSpotFleetRequestsCommandInput,
    CancelSpotFleetRequestsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CancelSpotFleetRequestsCommand extends CancelSpotFleetRequestsCommand_base {
  protected static __types: {
    api: {
      input: CancelSpotFleetRequestsRequest;
      output: CancelSpotFleetRequestsResponse;
    };
    sdk: {
      input: CancelSpotFleetRequestsCommandInput;
      output: CancelSpotFleetRequestsCommandOutput;
    };
  };
}
