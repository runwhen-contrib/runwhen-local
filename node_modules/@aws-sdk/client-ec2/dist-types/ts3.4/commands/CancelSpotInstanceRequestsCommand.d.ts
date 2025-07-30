import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CancelSpotInstanceRequestsRequest,
  CancelSpotInstanceRequestsResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface CancelSpotInstanceRequestsCommandInput
  extends CancelSpotInstanceRequestsRequest {}
export interface CancelSpotInstanceRequestsCommandOutput
  extends CancelSpotInstanceRequestsResult,
    __MetadataBearer {}
declare const CancelSpotInstanceRequestsCommand_base: {
  new (
    input: CancelSpotInstanceRequestsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelSpotInstanceRequestsCommandInput,
    CancelSpotInstanceRequestsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CancelSpotInstanceRequestsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelSpotInstanceRequestsCommandInput,
    CancelSpotInstanceRequestsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CancelSpotInstanceRequestsCommand extends CancelSpotInstanceRequestsCommand_base {
  protected static __types: {
    api: {
      input: CancelSpotInstanceRequestsRequest;
      output: CancelSpotInstanceRequestsResult;
    };
    sdk: {
      input: CancelSpotInstanceRequestsCommandInput;
      output: CancelSpotInstanceRequestsCommandOutput;
    };
  };
}
