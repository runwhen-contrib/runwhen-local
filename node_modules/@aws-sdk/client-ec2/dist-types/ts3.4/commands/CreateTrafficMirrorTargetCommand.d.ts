import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateTrafficMirrorTargetRequest,
  CreateTrafficMirrorTargetResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTrafficMirrorTargetCommandInput
  extends CreateTrafficMirrorTargetRequest {}
export interface CreateTrafficMirrorTargetCommandOutput
  extends CreateTrafficMirrorTargetResult,
    __MetadataBearer {}
declare const CreateTrafficMirrorTargetCommand_base: {
  new (
    input: CreateTrafficMirrorTargetCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTrafficMirrorTargetCommandInput,
    CreateTrafficMirrorTargetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CreateTrafficMirrorTargetCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTrafficMirrorTargetCommandInput,
    CreateTrafficMirrorTargetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTrafficMirrorTargetCommand extends CreateTrafficMirrorTargetCommand_base {
  protected static __types: {
    api: {
      input: CreateTrafficMirrorTargetRequest;
      output: CreateTrafficMirrorTargetResult;
    };
    sdk: {
      input: CreateTrafficMirrorTargetCommandInput;
      output: CreateTrafficMirrorTargetCommandOutput;
    };
  };
}
