import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { EnableVgwRoutePropagationRequest } from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface EnableVgwRoutePropagationCommandInput
  extends EnableVgwRoutePropagationRequest {}
export interface EnableVgwRoutePropagationCommandOutput
  extends __MetadataBearer {}
declare const EnableVgwRoutePropagationCommand_base: {
  new (
    input: EnableVgwRoutePropagationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    EnableVgwRoutePropagationCommandInput,
    EnableVgwRoutePropagationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: EnableVgwRoutePropagationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    EnableVgwRoutePropagationCommandInput,
    EnableVgwRoutePropagationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class EnableVgwRoutePropagationCommand extends EnableVgwRoutePropagationCommand_base {
  protected static __types: {
    api: {
      input: EnableVgwRoutePropagationRequest;
      output: {};
    };
    sdk: {
      input: EnableVgwRoutePropagationCommandInput;
      output: EnableVgwRoutePropagationCommandOutput;
    };
  };
}
