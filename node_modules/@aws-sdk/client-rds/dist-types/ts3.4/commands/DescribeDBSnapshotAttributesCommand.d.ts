import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeDBSnapshotAttributesMessage,
  DescribeDBSnapshotAttributesResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBSnapshotAttributesCommandInput
  extends DescribeDBSnapshotAttributesMessage {}
export interface DescribeDBSnapshotAttributesCommandOutput
  extends DescribeDBSnapshotAttributesResult,
    __MetadataBearer {}
declare const DescribeDBSnapshotAttributesCommand_base: {
  new (
    input: DescribeDBSnapshotAttributesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBSnapshotAttributesCommandInput,
    DescribeDBSnapshotAttributesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeDBSnapshotAttributesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBSnapshotAttributesCommandInput,
    DescribeDBSnapshotAttributesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBSnapshotAttributesCommand extends DescribeDBSnapshotAttributesCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBSnapshotAttributesMessage;
      output: DescribeDBSnapshotAttributesResult;
    };
    sdk: {
      input: DescribeDBSnapshotAttributesCommandInput;
      output: DescribeDBSnapshotAttributesCommandOutput;
    };
  };
}
