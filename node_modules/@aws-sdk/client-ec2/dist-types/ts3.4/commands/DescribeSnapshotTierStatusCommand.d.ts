import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeSnapshotTierStatusRequest,
  DescribeSnapshotTierStatusResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeSnapshotTierStatusCommandInput
  extends DescribeSnapshotTierStatusRequest {}
export interface DescribeSnapshotTierStatusCommandOutput
  extends DescribeSnapshotTierStatusResult,
    __MetadataBearer {}
declare const DescribeSnapshotTierStatusCommand_base: {
  new (
    input: DescribeSnapshotTierStatusCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSnapshotTierStatusCommandInput,
    DescribeSnapshotTierStatusCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeSnapshotTierStatusCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSnapshotTierStatusCommandInput,
    DescribeSnapshotTierStatusCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeSnapshotTierStatusCommand extends DescribeSnapshotTierStatusCommand_base {
  protected static __types: {
    api: {
      input: DescribeSnapshotTierStatusRequest;
      output: DescribeSnapshotTierStatusResult;
    };
    sdk: {
      input: DescribeSnapshotTierStatusCommandInput;
      output: DescribeSnapshotTierStatusCommandOutput;
    };
  };
}
