import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeSnapshotAttributeRequest,
  DescribeSnapshotAttributeResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeSnapshotAttributeCommandInput
  extends DescribeSnapshotAttributeRequest {}
export interface DescribeSnapshotAttributeCommandOutput
  extends DescribeSnapshotAttributeResult,
    __MetadataBearer {}
declare const DescribeSnapshotAttributeCommand_base: {
  new (
    input: DescribeSnapshotAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSnapshotAttributeCommandInput,
    DescribeSnapshotAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeSnapshotAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSnapshotAttributeCommandInput,
    DescribeSnapshotAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeSnapshotAttributeCommand extends DescribeSnapshotAttributeCommand_base {
  protected static __types: {
    api: {
      input: DescribeSnapshotAttributeRequest;
      output: DescribeSnapshotAttributeResult;
    };
    sdk: {
      input: DescribeSnapshotAttributeCommandInput;
      output: DescribeSnapshotAttributeCommandOutput;
    };
  };
}
