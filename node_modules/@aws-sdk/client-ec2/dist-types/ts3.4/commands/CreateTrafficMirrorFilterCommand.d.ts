import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateTrafficMirrorFilterRequest,
  CreateTrafficMirrorFilterResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTrafficMirrorFilterCommandInput
  extends CreateTrafficMirrorFilterRequest {}
export interface CreateTrafficMirrorFilterCommandOutput
  extends CreateTrafficMirrorFilterResult,
    __MetadataBearer {}
declare const CreateTrafficMirrorFilterCommand_base: {
  new (
    input: CreateTrafficMirrorFilterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTrafficMirrorFilterCommandInput,
    CreateTrafficMirrorFilterCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CreateTrafficMirrorFilterCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTrafficMirrorFilterCommandInput,
    CreateTrafficMirrorFilterCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTrafficMirrorFilterCommand extends CreateTrafficMirrorFilterCommand_base {
  protected static __types: {
    api: {
      input: CreateTrafficMirrorFilterRequest;
      output: CreateTrafficMirrorFilterResult;
    };
    sdk: {
      input: CreateTrafficMirrorFilterCommandInput;
      output: CreateTrafficMirrorFilterCommandOutput;
    };
  };
}
