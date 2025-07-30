import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ModifyActivityStreamRequest,
  ModifyActivityStreamResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyActivityStreamCommandInput
  extends ModifyActivityStreamRequest {}
export interface ModifyActivityStreamCommandOutput
  extends ModifyActivityStreamResponse,
    __MetadataBearer {}
declare const ModifyActivityStreamCommand_base: {
  new (
    input: ModifyActivityStreamCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyActivityStreamCommandInput,
    ModifyActivityStreamCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [ModifyActivityStreamCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyActivityStreamCommandInput,
    ModifyActivityStreamCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyActivityStreamCommand extends ModifyActivityStreamCommand_base {
  protected static __types: {
    api: {
      input: ModifyActivityStreamRequest;
      output: ModifyActivityStreamResponse;
    };
    sdk: {
      input: ModifyActivityStreamCommandInput;
      output: ModifyActivityStreamCommandOutput;
    };
  };
}
