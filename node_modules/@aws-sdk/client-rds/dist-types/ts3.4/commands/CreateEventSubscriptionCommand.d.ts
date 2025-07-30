import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateEventSubscriptionMessage,
  CreateEventSubscriptionResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateEventSubscriptionCommandInput
  extends CreateEventSubscriptionMessage {}
export interface CreateEventSubscriptionCommandOutput
  extends CreateEventSubscriptionResult,
    __MetadataBearer {}
declare const CreateEventSubscriptionCommand_base: {
  new (
    input: CreateEventSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateEventSubscriptionCommandInput,
    CreateEventSubscriptionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateEventSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateEventSubscriptionCommandInput,
    CreateEventSubscriptionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateEventSubscriptionCommand extends CreateEventSubscriptionCommand_base {
  protected static __types: {
    api: {
      input: CreateEventSubscriptionMessage;
      output: CreateEventSubscriptionResult;
    };
    sdk: {
      input: CreateEventSubscriptionCommandInput;
      output: CreateEventSubscriptionCommandOutput;
    };
  };
}
