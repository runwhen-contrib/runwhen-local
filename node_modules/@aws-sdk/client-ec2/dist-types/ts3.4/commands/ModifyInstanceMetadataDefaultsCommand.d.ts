import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyInstanceMetadataDefaultsRequest,
  ModifyInstanceMetadataDefaultsResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyInstanceMetadataDefaultsCommandInput
  extends ModifyInstanceMetadataDefaultsRequest {}
export interface ModifyInstanceMetadataDefaultsCommandOutput
  extends ModifyInstanceMetadataDefaultsResult,
    __MetadataBearer {}
declare const ModifyInstanceMetadataDefaultsCommand_base: {
  new (
    input: ModifyInstanceMetadataDefaultsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyInstanceMetadataDefaultsCommandInput,
    ModifyInstanceMetadataDefaultsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [ModifyInstanceMetadataDefaultsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyInstanceMetadataDefaultsCommandInput,
    ModifyInstanceMetadataDefaultsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyInstanceMetadataDefaultsCommand extends ModifyInstanceMetadataDefaultsCommand_base {
  protected static __types: {
    api: {
      input: ModifyInstanceMetadataDefaultsRequest;
      output: ModifyInstanceMetadataDefaultsResult;
    };
    sdk: {
      input: ModifyInstanceMetadataDefaultsCommandInput;
      output: ModifyInstanceMetadataDefaultsCommandOutput;
    };
  };
}
