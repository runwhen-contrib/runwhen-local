import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteTrafficMirrorSessionRequest,
  DeleteTrafficMirrorSessionResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteTrafficMirrorSessionCommandInput
  extends DeleteTrafficMirrorSessionRequest {}
export interface DeleteTrafficMirrorSessionCommandOutput
  extends DeleteTrafficMirrorSessionResult,
    __MetadataBearer {}
declare const DeleteTrafficMirrorSessionCommand_base: {
  new (
    input: DeleteTrafficMirrorSessionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTrafficMirrorSessionCommandInput,
    DeleteTrafficMirrorSessionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTrafficMirrorSessionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTrafficMirrorSessionCommandInput,
    DeleteTrafficMirrorSessionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTrafficMirrorSessionCommand extends DeleteTrafficMirrorSessionCommand_base {
  protected static __types: {
    api: {
      input: DeleteTrafficMirrorSessionRequest;
      output: DeleteTrafficMirrorSessionResult;
    };
    sdk: {
      input: DeleteTrafficMirrorSessionCommandInput;
      output: DeleteTrafficMirrorSessionCommandOutput;
    };
  };
}
