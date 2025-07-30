import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetInstanceTypesFromInstanceRequirementsRequest,
  GetInstanceTypesFromInstanceRequirementsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetInstanceTypesFromInstanceRequirementsCommandInput
  extends GetInstanceTypesFromInstanceRequirementsRequest {}
export interface GetInstanceTypesFromInstanceRequirementsCommandOutput
  extends GetInstanceTypesFromInstanceRequirementsResult,
    __MetadataBearer {}
declare const GetInstanceTypesFromInstanceRequirementsCommand_base: {
  new (
    input: GetInstanceTypesFromInstanceRequirementsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetInstanceTypesFromInstanceRequirementsCommandInput,
    GetInstanceTypesFromInstanceRequirementsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetInstanceTypesFromInstanceRequirementsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetInstanceTypesFromInstanceRequirementsCommandInput,
    GetInstanceTypesFromInstanceRequirementsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetInstanceTypesFromInstanceRequirementsCommand extends GetInstanceTypesFromInstanceRequirementsCommand_base {
  protected static __types: {
    api: {
      input: GetInstanceTypesFromInstanceRequirementsRequest;
      output: GetInstanceTypesFromInstanceRequirementsResult;
    };
    sdk: {
      input: GetInstanceTypesFromInstanceRequirementsCommandInput;
      output: GetInstanceTypesFromInstanceRequirementsCommandOutput;
    };
  };
}
