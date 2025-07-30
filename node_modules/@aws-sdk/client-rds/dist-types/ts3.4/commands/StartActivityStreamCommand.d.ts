import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  StartActivityStreamRequest,
  StartActivityStreamResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface StartActivityStreamCommandInput
  extends StartActivityStreamRequest {}
export interface StartActivityStreamCommandOutput
  extends StartActivityStreamResponse,
    __MetadataBearer {}
declare const StartActivityStreamCommand_base: {
  new (
    input: StartActivityStreamCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StartActivityStreamCommandInput,
    StartActivityStreamCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: StartActivityStreamCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StartActivityStreamCommandInput,
    StartActivityStreamCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class StartActivityStreamCommand extends StartActivityStreamCommand_base {
  protected static __types: {
    api: {
      input: StartActivityStreamRequest;
      output: StartActivityStreamResponse;
    };
    sdk: {
      input: StartActivityStreamCommandInput;
      output: StartActivityStreamCommandOutput;
    };
  };
}
