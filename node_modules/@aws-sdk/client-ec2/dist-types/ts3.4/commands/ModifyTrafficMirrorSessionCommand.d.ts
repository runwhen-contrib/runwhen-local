import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyTrafficMirrorSessionRequest,
  ModifyTrafficMirrorSessionResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyTrafficMirrorSessionCommandInput
  extends ModifyTrafficMirrorSessionRequest {}
export interface ModifyTrafficMirrorSessionCommandOutput
  extends ModifyTrafficMirrorSessionResult,
    __MetadataBearer {}
declare const ModifyTrafficMirrorSessionCommand_base: {
  new (
    input: ModifyTrafficMirrorSessionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyTrafficMirrorSessionCommandInput,
    ModifyTrafficMirrorSessionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyTrafficMirrorSessionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyTrafficMirrorSessionCommandInput,
    ModifyTrafficMirrorSessionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyTrafficMirrorSessionCommand extends ModifyTrafficMirrorSessionCommand_base {
  protected static __types: {
    api: {
      input: ModifyTrafficMirrorSessionRequest;
      output: ModifyTrafficMirrorSessionResult;
    };
    sdk: {
      input: ModifyTrafficMirrorSessionCommandInput;
      output: ModifyTrafficMirrorSessionCommandOutput;
    };
  };
}
