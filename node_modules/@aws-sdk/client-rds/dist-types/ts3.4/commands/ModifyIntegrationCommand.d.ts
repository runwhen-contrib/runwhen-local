import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { Integration } from "../models/models_0";
import { ModifyIntegrationMessage } from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyIntegrationCommandInput
  extends ModifyIntegrationMessage {}
export interface ModifyIntegrationCommandOutput
  extends Integration,
    __MetadataBearer {}
declare const ModifyIntegrationCommand_base: {
  new (
    input: ModifyIntegrationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyIntegrationCommandInput,
    ModifyIntegrationCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyIntegrationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyIntegrationCommandInput,
    ModifyIntegrationCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyIntegrationCommand extends ModifyIntegrationCommand_base {
  protected static __types: {
    api: {
      input: ModifyIntegrationMessage;
      output: Integration;
    };
    sdk: {
      input: ModifyIntegrationCommandInput;
      output: ModifyIntegrationCommandOutput;
    };
  };
}
