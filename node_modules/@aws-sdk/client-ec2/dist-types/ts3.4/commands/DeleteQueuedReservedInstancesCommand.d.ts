import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteQueuedReservedInstancesRequest,
  DeleteQueuedReservedInstancesResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteQueuedReservedInstancesCommandInput
  extends DeleteQueuedReservedInstancesRequest {}
export interface DeleteQueuedReservedInstancesCommandOutput
  extends DeleteQueuedReservedInstancesResult,
    __MetadataBearer {}
declare const DeleteQueuedReservedInstancesCommand_base: {
  new (
    input: DeleteQueuedReservedInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteQueuedReservedInstancesCommandInput,
    DeleteQueuedReservedInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteQueuedReservedInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteQueuedReservedInstancesCommandInput,
    DeleteQueuedReservedInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteQueuedReservedInstancesCommand extends DeleteQueuedReservedInstancesCommand_base {
  protected static __types: {
    api: {
      input: DeleteQueuedReservedInstancesRequest;
      output: DeleteQueuedReservedInstancesResult;
    };
    sdk: {
      input: DeleteQueuedReservedInstancesCommandInput;
      output: DeleteQueuedReservedInstancesCommandOutput;
    };
  };
}
