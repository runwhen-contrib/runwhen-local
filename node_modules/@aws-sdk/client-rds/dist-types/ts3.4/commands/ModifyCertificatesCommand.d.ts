import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ModifyCertificatesMessage,
  ModifyCertificatesResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyCertificatesCommandInput
  extends ModifyCertificatesMessage {}
export interface ModifyCertificatesCommandOutput
  extends ModifyCertificatesResult,
    __MetadataBearer {}
declare const ModifyCertificatesCommand_base: {
  new (
    input: ModifyCertificatesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyCertificatesCommandInput,
    ModifyCertificatesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [ModifyCertificatesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyCertificatesCommandInput,
    ModifyCertificatesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyCertificatesCommand extends ModifyCertificatesCommand_base {
  protected static __types: {
    api: {
      input: ModifyCertificatesMessage;
      output: ModifyCertificatesResult;
    };
    sdk: {
      input: ModifyCertificatesCommandInput;
      output: ModifyCertificatesCommandOutput;
    };
  };
}
