import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteTrafficMirrorTargetRequest,
  DeleteTrafficMirrorTargetResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteTrafficMirrorTargetCommandInput
  extends DeleteTrafficMirrorTargetRequest {}
export interface DeleteTrafficMirrorTargetCommandOutput
  extends DeleteTrafficMirrorTargetResult,
    __MetadataBearer {}
declare const DeleteTrafficMirrorTargetCommand_base: {
  new (
    input: DeleteTrafficMirrorTargetCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTrafficMirrorTargetCommandInput,
    DeleteTrafficMirrorTargetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTrafficMirrorTargetCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTrafficMirrorTargetCommandInput,
    DeleteTrafficMirrorTargetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTrafficMirrorTargetCommand extends DeleteTrafficMirrorTargetCommand_base {
  protected static __types: {
    api: {
      input: DeleteTrafficMirrorTargetRequest;
      output: DeleteTrafficMirrorTargetResult;
    };
    sdk: {
      input: DeleteTrafficMirrorTargetCommandInput;
      output: DeleteTrafficMirrorTargetCommandOutput;
    };
  };
}
