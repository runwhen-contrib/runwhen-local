import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { ReplaceRouteRequest } from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ReplaceRouteCommandInput extends ReplaceRouteRequest {}
export interface ReplaceRouteCommandOutput extends __MetadataBearer {}
declare const ReplaceRouteCommand_base: {
  new (
    input: ReplaceRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceRouteCommandInput,
    ReplaceRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ReplaceRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceRouteCommandInput,
    ReplaceRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ReplaceRouteCommand extends ReplaceRouteCommand_base {
  protected static __types: {
    api: {
      input: ReplaceRouteRequest;
      output: {};
    };
    sdk: {
      input: ReplaceRouteCommandInput;
      output: ReplaceRouteCommandOutput;
    };
  };
}
