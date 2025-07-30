import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  StopActivityStreamRequest,
  StopActivityStreamResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface StopActivityStreamCommandInput
  extends StopActivityStreamRequest {}
export interface StopActivityStreamCommandOutput
  extends StopActivityStreamResponse,
    __MetadataBearer {}
declare const StopActivityStreamCommand_base: {
  new (
    input: StopActivityStreamCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StopActivityStreamCommandInput,
    StopActivityStreamCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: StopActivityStreamCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StopActivityStreamCommandInput,
    StopActivityStreamCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class StopActivityStreamCommand extends StopActivityStreamCommand_base {
  protected static __types: {
    api: {
      input: StopActivityStreamRequest;
      output: StopActivityStreamResponse;
    };
    sdk: {
      input: StopActivityStreamCommandInput;
      output: StopActivityStreamCommandOutput;
    };
  };
}
