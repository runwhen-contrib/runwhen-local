import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateRouteTableRequest,
  CreateRouteTableResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateRouteTableCommandInput extends CreateRouteTableRequest {}
export interface CreateRouteTableCommandOutput
  extends CreateRouteTableResult,
    __MetadataBearer {}
declare const CreateRouteTableCommand_base: {
  new (
    input: CreateRouteTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateRouteTableCommandInput,
    CreateRouteTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateRouteTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateRouteTableCommandInput,
    CreateRouteTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateRouteTableCommand extends CreateRouteTableCommand_base {
  protected static __types: {
    api: {
      input: CreateRouteTableRequest;
      output: CreateRouteTableResult;
    };
    sdk: {
      input: CreateRouteTableCommandInput;
      output: CreateRouteTableCommandOutput;
    };
  };
}
