import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ModifyEventSubscriptionMessage,
  ModifyEventSubscriptionResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyEventSubscriptionCommandInput
  extends ModifyEventSubscriptionMessage {}
export interface ModifyEventSubscriptionCommandOutput
  extends ModifyEventSubscriptionResult,
    __MetadataBearer {}
declare const ModifyEventSubscriptionCommand_base: {
  new (
    input: ModifyEventSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyEventSubscriptionCommandInput,
    ModifyEventSubscriptionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyEventSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyEventSubscriptionCommandInput,
    ModifyEventSubscriptionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyEventSubscriptionCommand extends ModifyEventSubscriptionCommand_base {
  protected static __types: {
    api: {
      input: ModifyEventSubscriptionMessage;
      output: ModifyEventSubscriptionResult;
    };
    sdk: {
      input: ModifyEventSubscriptionCommandInput;
      output: ModifyEventSubscriptionCommandOutput;
    };
  };
}
