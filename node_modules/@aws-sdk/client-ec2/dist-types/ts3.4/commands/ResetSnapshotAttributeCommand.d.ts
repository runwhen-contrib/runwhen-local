import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { ResetSnapshotAttributeRequest } from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ResetSnapshotAttributeCommandInput
  extends ResetSnapshotAttributeRequest {}
export interface ResetSnapshotAttributeCommandOutput extends __MetadataBearer {}
declare const ResetSnapshotAttributeCommand_base: {
  new (
    input: ResetSnapshotAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetSnapshotAttributeCommandInput,
    ResetSnapshotAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ResetSnapshotAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetSnapshotAttributeCommandInput,
    ResetSnapshotAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ResetSnapshotAttributeCommand extends ResetSnapshotAttributeCommand_base {
  protected static __types: {
    api: {
      input: ResetSnapshotAttributeRequest;
      output: {};
    };
    sdk: {
      input: ResetSnapshotAttributeCommandInput;
      output: ResetSnapshotAttributeCommandOutput;
    };
  };
}
