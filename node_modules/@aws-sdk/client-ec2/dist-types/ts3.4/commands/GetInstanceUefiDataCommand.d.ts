import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetInstanceUefiDataRequest,
  GetInstanceUefiDataResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetInstanceUefiDataCommandInput
  extends GetInstanceUefiDataRequest {}
export interface GetInstanceUefiDataCommandOutput
  extends GetInstanceUefiDataResult,
    __MetadataBearer {}
declare const GetInstanceUefiDataCommand_base: {
  new (
    input: GetInstanceUefiDataCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetInstanceUefiDataCommandInput,
    GetInstanceUefiDataCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetInstanceUefiDataCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetInstanceUefiDataCommandInput,
    GetInstanceUefiDataCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetInstanceUefiDataCommand extends GetInstanceUefiDataCommand_base {
  protected static __types: {
    api: {
      input: GetInstanceUefiDataRequest;
      output: GetInstanceUefiDataResult;
    };
    sdk: {
      input: GetInstanceUefiDataCommandInput;
      output: GetInstanceUefiDataCommandOutput;
    };
  };
}
