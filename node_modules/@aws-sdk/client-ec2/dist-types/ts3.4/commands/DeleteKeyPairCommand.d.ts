import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteKeyPairRequest, DeleteKeyPairResult } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteKeyPairCommandInput extends DeleteKeyPairRequest {}
export interface DeleteKeyPairCommandOutput
  extends DeleteKeyPairResult,
    __MetadataBearer {}
declare const DeleteKeyPairCommand_base: {
  new (
    input: DeleteKeyPairCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteKeyPairCommandInput,
    DeleteKeyPairCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DeleteKeyPairCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteKeyPairCommandInput,
    DeleteKeyPairCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteKeyPairCommand extends DeleteKeyPairCommand_base {
  protected static __types: {
    api: {
      input: DeleteKeyPairRequest;
      output: DeleteKeyPairResult;
    };
    sdk: {
      input: DeleteKeyPairCommandInput;
      output: DeleteKeyPairCommandOutput;
    };
  };
}
