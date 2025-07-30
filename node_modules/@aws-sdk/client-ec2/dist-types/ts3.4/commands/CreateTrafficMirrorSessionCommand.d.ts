import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateTrafficMirrorSessionRequest,
  CreateTrafficMirrorSessionResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTrafficMirrorSessionCommandInput
  extends CreateTrafficMirrorSessionRequest {}
export interface CreateTrafficMirrorSessionCommandOutput
  extends CreateTrafficMirrorSessionResult,
    __MetadataBearer {}
declare const CreateTrafficMirrorSessionCommand_base: {
  new (
    input: CreateTrafficMirrorSessionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTrafficMirrorSessionCommandInput,
    CreateTrafficMirrorSessionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateTrafficMirrorSessionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTrafficMirrorSessionCommandInput,
    CreateTrafficMirrorSessionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTrafficMirrorSessionCommand extends CreateTrafficMirrorSessionCommand_base {
  protected static __types: {
    api: {
      input: CreateTrafficMirrorSessionRequest;
      output: CreateTrafficMirrorSessionResult;
    };
    sdk: {
      input: CreateTrafficMirrorSessionCommandInput;
      output: CreateTrafficMirrorSessionCommandOutput;
    };
  };
}
