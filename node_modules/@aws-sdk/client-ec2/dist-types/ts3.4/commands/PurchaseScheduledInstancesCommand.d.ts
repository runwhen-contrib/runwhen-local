import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  PurchaseScheduledInstancesRequest,
  PurchaseScheduledInstancesResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface PurchaseScheduledInstancesCommandInput
  extends PurchaseScheduledInstancesRequest {}
export interface PurchaseScheduledInstancesCommandOutput
  extends PurchaseScheduledInstancesResult,
    __MetadataBearer {}
declare const PurchaseScheduledInstancesCommand_base: {
  new (
    input: PurchaseScheduledInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PurchaseScheduledInstancesCommandInput,
    PurchaseScheduledInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: PurchaseScheduledInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PurchaseScheduledInstancesCommandInput,
    PurchaseScheduledInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class PurchaseScheduledInstancesCommand extends PurchaseScheduledInstancesCommand_base {
  protected static __types: {
    api: {
      input: PurchaseScheduledInstancesRequest;
      output: PurchaseScheduledInstancesResult;
    };
    sdk: {
      input: PurchaseScheduledInstancesCommandInput;
      output: PurchaseScheduledInstancesCommandOutput;
    };
  };
}
