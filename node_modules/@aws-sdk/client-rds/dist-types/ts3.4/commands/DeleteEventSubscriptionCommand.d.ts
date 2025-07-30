import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DeleteEventSubscriptionMessage,
  DeleteEventSubscriptionResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteEventSubscriptionCommandInput
  extends DeleteEventSubscriptionMessage {}
export interface DeleteEventSubscriptionCommandOutput
  extends DeleteEventSubscriptionResult,
    __MetadataBearer {}
declare const DeleteEventSubscriptionCommand_base: {
  new (
    input: DeleteEventSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteEventSubscriptionCommandInput,
    DeleteEventSubscriptionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteEventSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteEventSubscriptionCommandInput,
    DeleteEventSubscriptionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteEventSubscriptionCommand extends DeleteEventSubscriptionCommand_base {
  protected static __types: {
    api: {
      input: DeleteEventSubscriptionMessage;
      output: DeleteEventSubscriptionResult;
    };
    sdk: {
      input: DeleteEventSubscriptionCommandInput;
      output: DeleteEventSubscriptionCommandOutput;
    };
  };
}
