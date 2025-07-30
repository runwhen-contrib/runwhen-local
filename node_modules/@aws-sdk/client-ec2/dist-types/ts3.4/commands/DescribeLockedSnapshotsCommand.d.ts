import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeLockedSnapshotsRequest,
  DescribeLockedSnapshotsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeLockedSnapshotsCommandInput
  extends DescribeLockedSnapshotsRequest {}
export interface DescribeLockedSnapshotsCommandOutput
  extends DescribeLockedSnapshotsResult,
    __MetadataBearer {}
declare const DescribeLockedSnapshotsCommand_base: {
  new (
    input: DescribeLockedSnapshotsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLockedSnapshotsCommandInput,
    DescribeLockedSnapshotsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeLockedSnapshotsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLockedSnapshotsCommandInput,
    DescribeLockedSnapshotsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeLockedSnapshotsCommand extends DescribeLockedSnapshotsCommand_base {
  protected static __types: {
    api: {
      input: DescribeLockedSnapshotsRequest;
      output: DescribeLockedSnapshotsResult;
    };
    sdk: {
      input: DescribeLockedSnapshotsCommandInput;
      output: DescribeLockedSnapshotsCommandOutput;
    };
  };
}
