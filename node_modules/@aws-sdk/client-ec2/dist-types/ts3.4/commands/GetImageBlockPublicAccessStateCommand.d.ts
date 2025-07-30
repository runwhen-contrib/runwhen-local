import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetImageBlockPublicAccessStateRequest,
  GetImageBlockPublicAccessStateResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetImageBlockPublicAccessStateCommandInput
  extends GetImageBlockPublicAccessStateRequest {}
export interface GetImageBlockPublicAccessStateCommandOutput
  extends GetImageBlockPublicAccessStateResult,
    __MetadataBearer {}
declare const GetImageBlockPublicAccessStateCommand_base: {
  new (
    input: GetImageBlockPublicAccessStateCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetImageBlockPublicAccessStateCommandInput,
    GetImageBlockPublicAccessStateCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [GetImageBlockPublicAccessStateCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    GetImageBlockPublicAccessStateCommandInput,
    GetImageBlockPublicAccessStateCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetImageBlockPublicAccessStateCommand extends GetImageBlockPublicAccessStateCommand_base {
  protected static __types: {
    api: {
      input: GetImageBlockPublicAccessStateRequest;
      output: GetImageBlockPublicAccessStateResult;
    };
    sdk: {
      input: GetImageBlockPublicAccessStateCommandInput;
      output: GetImageBlockPublicAccessStateCommandOutput;
    };
  };
}
