import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeSnapshotsRequest,
  DescribeSnapshotsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeSnapshotsCommandInput
  extends DescribeSnapshotsRequest {}
export interface DescribeSnapshotsCommandOutput
  extends DescribeSnapshotsResult,
    __MetadataBearer {}
declare const DescribeSnapshotsCommand_base: {
  new (
    input: DescribeSnapshotsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSnapshotsCommandInput,
    DescribeSnapshotsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeSnapshotsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSnapshotsCommandInput,
    DescribeSnapshotsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeSnapshotsCommand extends DescribeSnapshotsCommand_base {
  protected static __types: {
    api: {
      input: DescribeSnapshotsRequest;
      output: DescribeSnapshotsResult;
    };
    sdk: {
      input: DescribeSnapshotsCommandInput;
      output: DescribeSnapshotsCommandOutput;
    };
  };
}
