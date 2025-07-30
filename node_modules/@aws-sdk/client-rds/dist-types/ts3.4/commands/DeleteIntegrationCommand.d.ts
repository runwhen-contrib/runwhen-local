import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DeleteIntegrationMessage, Integration } from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteIntegrationCommandInput
  extends DeleteIntegrationMessage {}
export interface DeleteIntegrationCommandOutput
  extends Integration,
    __MetadataBearer {}
declare const DeleteIntegrationCommand_base: {
  new (
    input: DeleteIntegrationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteIntegrationCommandInput,
    DeleteIntegrationCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteIntegrationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteIntegrationCommandInput,
    DeleteIntegrationCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteIntegrationCommand extends DeleteIntegrationCommand_base {
  protected static __types: {
    api: {
      input: DeleteIntegrationMessage;
      output: Integration;
    };
    sdk: {
      input: DeleteIntegrationCommandInput;
      output: DeleteIntegrationCommandOutput;
    };
  };
}
