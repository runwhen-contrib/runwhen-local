import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { CreateRouteRequest, CreateRouteResult } from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateRouteCommandInput extends CreateRouteRequest {}
export interface CreateRouteCommandOutput
  extends CreateRouteResult,
    __MetadataBearer {}
declare const CreateRouteCommand_base: {
  new (
    input: CreateRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateRouteCommandInput,
    CreateRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateRouteCommandInput,
    CreateRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateRouteCommand extends CreateRouteCommand_base {
  protected static __types: {
    api: {
      input: CreateRouteRequest;
      output: CreateRouteResult;
    };
    sdk: {
      input: CreateRouteCommandInput;
      output: CreateRouteCommandOutput;
    };
  };
}
