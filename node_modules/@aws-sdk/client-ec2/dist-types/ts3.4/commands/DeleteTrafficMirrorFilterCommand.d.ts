import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteTrafficMirrorFilterRequest,
  DeleteTrafficMirrorFilterResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteTrafficMirrorFilterCommandInput
  extends DeleteTrafficMirrorFilterRequest {}
export interface DeleteTrafficMirrorFilterCommandOutput
  extends DeleteTrafficMirrorFilterResult,
    __MetadataBearer {}
declare const DeleteTrafficMirrorFilterCommand_base: {
  new (
    input: DeleteTrafficMirrorFilterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTrafficMirrorFilterCommandInput,
    DeleteTrafficMirrorFilterCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTrafficMirrorFilterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTrafficMirrorFilterCommandInput,
    DeleteTrafficMirrorFilterCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTrafficMirrorFilterCommand extends DeleteTrafficMirrorFilterCommand_base {
  protected static __types: {
    api: {
      input: DeleteTrafficMirrorFilterRequest;
      output: DeleteTrafficMirrorFilterResult;
    };
    sdk: {
      input: DeleteTrafficMirrorFilterCommandInput;
      output: DeleteTrafficMirrorFilterCommandOutput;
    };
  };
}
