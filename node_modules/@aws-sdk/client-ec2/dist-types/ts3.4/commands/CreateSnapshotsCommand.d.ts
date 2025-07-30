import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateSnapshotsRequest,
  CreateSnapshotsResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateSnapshotsCommandInput extends CreateSnapshotsRequest {}
export interface CreateSnapshotsCommandOutput
  extends CreateSnapshotsResult,
    __MetadataBearer {}
declare const CreateSnapshotsCommand_base: {
  new (
    input: CreateSnapshotsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateSnapshotsCommandInput,
    CreateSnapshotsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateSnapshotsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateSnapshotsCommandInput,
    CreateSnapshotsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateSnapshotsCommand extends CreateSnapshotsCommand_base {
  protected static __types: {
    api: {
      input: CreateSnapshotsRequest;
      output: CreateSnapshotsResult;
    };
    sdk: {
      input: CreateSnapshotsCommandInput;
      output: CreateSnapshotsCommandOutput;
    };
  };
}
