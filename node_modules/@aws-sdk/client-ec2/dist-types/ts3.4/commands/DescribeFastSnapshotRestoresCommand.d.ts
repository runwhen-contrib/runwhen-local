import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeFastSnapshotRestoresRequest,
  DescribeFastSnapshotRestoresResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeFastSnapshotRestoresCommandInput
  extends DescribeFastSnapshotRestoresRequest {}
export interface DescribeFastSnapshotRestoresCommandOutput
  extends DescribeFastSnapshotRestoresResult,
    __MetadataBearer {}
declare const DescribeFastSnapshotRestoresCommand_base: {
  new (
    input: DescribeFastSnapshotRestoresCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeFastSnapshotRestoresCommandInput,
    DescribeFastSnapshotRestoresCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeFastSnapshotRestoresCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeFastSnapshotRestoresCommandInput,
    DescribeFastSnapshotRestoresCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeFastSnapshotRestoresCommand extends DescribeFastSnapshotRestoresCommand_base {
  protected static __types: {
    api: {
      input: DescribeFastSnapshotRestoresRequest;
      output: DescribeFastSnapshotRestoresResult;
    };
    sdk: {
      input: DescribeFastSnapshotRestoresCommandInput;
      output: DescribeFastSnapshotRestoresCommandOutput;
    };
  };
}
