import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  RemoveSourceIdentifierFromSubscriptionMessage,
  RemoveSourceIdentifierFromSubscriptionResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RemoveSourceIdentifierFromSubscriptionCommandInput
  extends RemoveSourceIdentifierFromSubscriptionMessage {}
export interface RemoveSourceIdentifierFromSubscriptionCommandOutput
  extends RemoveSourceIdentifierFromSubscriptionResult,
    __MetadataBearer {}
declare const RemoveSourceIdentifierFromSubscriptionCommand_base: {
  new (
    input: RemoveSourceIdentifierFromSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RemoveSourceIdentifierFromSubscriptionCommandInput,
    RemoveSourceIdentifierFromSubscriptionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RemoveSourceIdentifierFromSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RemoveSourceIdentifierFromSubscriptionCommandInput,
    RemoveSourceIdentifierFromSubscriptionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RemoveSourceIdentifierFromSubscriptionCommand extends RemoveSourceIdentifierFromSubscriptionCommand_base {
  protected static __types: {
    api: {
      input: RemoveSourceIdentifierFromSubscriptionMessage;
      output: RemoveSourceIdentifierFromSubscriptionResult;
    };
    sdk: {
      input: RemoveSourceIdentifierFromSubscriptionCommandInput;
      output: RemoveSourceIdentifierFromSubscriptionCommandOutput;
    };
  };
}
