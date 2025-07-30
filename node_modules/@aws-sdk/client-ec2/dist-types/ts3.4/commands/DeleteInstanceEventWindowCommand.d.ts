import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteInstanceEventWindowRequest,
  DeleteInstanceEventWindowResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteInstanceEventWindowCommandInput
  extends DeleteInstanceEventWindowRequest {}
export interface DeleteInstanceEventWindowCommandOutput
  extends DeleteInstanceEventWindowResult,
    __MetadataBearer {}
declare const DeleteInstanceEventWindowCommand_base: {
  new (
    input: DeleteInstanceEventWindowCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteInstanceEventWindowCommandInput,
    DeleteInstanceEventWindowCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteInstanceEventWindowCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteInstanceEventWindowCommandInput,
    DeleteInstanceEventWindowCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteInstanceEventWindowCommand extends DeleteInstanceEventWindowCommand_base {
  protected static __types: {
    api: {
      input: DeleteInstanceEventWindowRequest;
      output: DeleteInstanceEventWindowResult;
    };
    sdk: {
      input: DeleteInstanceEventWindowCommandInput;
      output: DeleteInstanceEventWindowCommandOutput;
    };
  };
}
