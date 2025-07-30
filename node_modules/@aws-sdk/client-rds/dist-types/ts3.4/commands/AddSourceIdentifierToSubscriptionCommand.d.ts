import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  AddSourceIdentifierToSubscriptionMessage,
  AddSourceIdentifierToSubscriptionResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface AddSourceIdentifierToSubscriptionCommandInput
  extends AddSourceIdentifierToSubscriptionMessage {}
export interface AddSourceIdentifierToSubscriptionCommandOutput
  extends AddSourceIdentifierToSubscriptionResult,
    __MetadataBearer {}
declare const AddSourceIdentifierToSubscriptionCommand_base: {
  new (
    input: AddSourceIdentifierToSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AddSourceIdentifierToSubscriptionCommandInput,
    AddSourceIdentifierToSubscriptionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AddSourceIdentifierToSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AddSourceIdentifierToSubscriptionCommandInput,
    AddSourceIdentifierToSubscriptionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AddSourceIdentifierToSubscriptionCommand extends AddSourceIdentifierToSubscriptionCommand_base {
  protected static __types: {
    api: {
      input: AddSourceIdentifierToSubscriptionMessage;
      output: AddSourceIdentifierToSubscriptionResult;
    };
    sdk: {
      input: AddSourceIdentifierToSubscriptionCommandInput;
      output: AddSourceIdentifierToSubscriptionCommandOutput;
    };
  };
}
