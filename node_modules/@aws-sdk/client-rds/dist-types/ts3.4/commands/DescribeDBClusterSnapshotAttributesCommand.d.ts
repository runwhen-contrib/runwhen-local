import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeDBClusterSnapshotAttributesMessage,
  DescribeDBClusterSnapshotAttributesResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBClusterSnapshotAttributesCommandInput
  extends DescribeDBClusterSnapshotAttributesMessage {}
export interface DescribeDBClusterSnapshotAttributesCommandOutput
  extends DescribeDBClusterSnapshotAttributesResult,
    __MetadataBearer {}
declare const DescribeDBClusterSnapshotAttributesCommand_base: {
  new (
    input: DescribeDBClusterSnapshotAttributesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClusterSnapshotAttributesCommandInput,
    DescribeDBClusterSnapshotAttributesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeDBClusterSnapshotAttributesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClusterSnapshotAttributesCommandInput,
    DescribeDBClusterSnapshotAttributesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBClusterSnapshotAttributesCommand extends DescribeDBClusterSnapshotAttributesCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBClusterSnapshotAttributesMessage;
      output: DescribeDBClusterSnapshotAttributesResult;
    };
    sdk: {
      input: DescribeDBClusterSnapshotAttributesCommandInput;
      output: DescribeDBClusterSnapshotAttributesCommandOutput;
    };
  };
}
