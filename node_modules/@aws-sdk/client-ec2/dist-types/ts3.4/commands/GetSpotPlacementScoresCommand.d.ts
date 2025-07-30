import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetSpotPlacementScoresRequest,
  GetSpotPlacementScoresResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetSpotPlacementScoresCommandInput
  extends GetSpotPlacementScoresRequest {}
export interface GetSpotPlacementScoresCommandOutput
  extends GetSpotPlacementScoresResult,
    __MetadataBearer {}
declare const GetSpotPlacementScoresCommand_base: {
  new (
    input: GetSpotPlacementScoresCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetSpotPlacementScoresCommandInput,
    GetSpotPlacementScoresCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetSpotPlacementScoresCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetSpotPlacementScoresCommandInput,
    GetSpotPlacementScoresCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetSpotPlacementScoresCommand extends GetSpotPlacementScoresCommand_base {
  protected static __types: {
    api: {
      input: GetSpotPlacementScoresRequest;
      output: GetSpotPlacementScoresResult;
    };
    sdk: {
      input: GetSpotPlacementScoresCommandInput;
      output: GetSpotPlacementScoresCommandOutput;
    };
  };
}
