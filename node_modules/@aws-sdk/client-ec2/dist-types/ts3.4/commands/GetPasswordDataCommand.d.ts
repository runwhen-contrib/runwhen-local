import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetPasswordDataRequest,
  GetPasswordDataResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetPasswordDataCommandInput extends GetPasswordDataRequest {}
export interface GetPasswordDataCommandOutput
  extends GetPasswordDataResult,
    __MetadataBearer {}
declare const GetPasswordDataCommand_base: {
  new (
    input: GetPasswordDataCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetPasswordDataCommandInput,
    GetPasswordDataCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetPasswordDataCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetPasswordDataCommandInput,
    GetPasswordDataCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetPasswordDataCommand extends GetPasswordDataCommand_base {
  protected static __types: {
    api: {
      input: GetPasswordDataRequest;
      output: GetPasswordDataResult;
    };
    sdk: {
      input: GetPasswordDataCommandInput;
      output: GetPasswordDataCommandOutput;
    };
  };
}
