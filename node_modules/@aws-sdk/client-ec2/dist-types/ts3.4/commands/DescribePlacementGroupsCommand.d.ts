import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribePlacementGroupsRequest,
  DescribePlacementGroupsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribePlacementGroupsCommandInput
  extends DescribePlacementGroupsRequest {}
export interface DescribePlacementGroupsCommandOutput
  extends DescribePlacementGroupsResult,
    __MetadataBearer {}
declare const DescribePlacementGroupsCommand_base: {
  new (
    input: DescribePlacementGroupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribePlacementGroupsCommandInput,
    DescribePlacementGroupsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribePlacementGroupsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribePlacementGroupsCommandInput,
    DescribePlacementGroupsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribePlacementGroupsCommand extends DescribePlacementGroupsCommand_base {
  protected static __types: {
    api: {
      input: DescribePlacementGroupsRequest;
      output: DescribePlacementGroupsResult;
    };
    sdk: {
      input: DescribePlacementGroupsCommandInput;
      output: DescribePlacementGroupsCommandOutput;
    };
  };
}
