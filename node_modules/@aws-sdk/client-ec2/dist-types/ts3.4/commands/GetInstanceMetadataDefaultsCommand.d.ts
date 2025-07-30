import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetInstanceMetadataDefaultsRequest,
  GetInstanceMetadataDefaultsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetInstanceMetadataDefaultsCommandInput
  extends GetInstanceMetadataDefaultsRequest {}
export interface GetInstanceMetadataDefaultsCommandOutput
  extends GetInstanceMetadataDefaultsResult,
    __MetadataBearer {}
declare const GetInstanceMetadataDefaultsCommand_base: {
  new (
    input: GetInstanceMetadataDefaultsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetInstanceMetadataDefaultsCommandInput,
    GetInstanceMetadataDefaultsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [GetInstanceMetadataDefaultsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    GetInstanceMetadataDefaultsCommandInput,
    GetInstanceMetadataDefaultsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetInstanceMetadataDefaultsCommand extends GetInstanceMetadataDefaultsCommand_base {
  protected static __types: {
    api: {
      input: GetInstanceMetadataDefaultsRequest;
      output: GetInstanceMetadataDefaultsResult;
    };
    sdk: {
      input: GetInstanceMetadataDefaultsCommandInput;
      output: GetInstanceMetadataDefaultsCommandOutput;
    };
  };
}
