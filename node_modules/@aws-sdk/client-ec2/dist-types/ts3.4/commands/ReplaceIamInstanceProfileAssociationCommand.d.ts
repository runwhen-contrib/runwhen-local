import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ReplaceIamInstanceProfileAssociationRequest,
  ReplaceIamInstanceProfileAssociationResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ReplaceIamInstanceProfileAssociationCommandInput
  extends ReplaceIamInstanceProfileAssociationRequest {}
export interface ReplaceIamInstanceProfileAssociationCommandOutput
  extends ReplaceIamInstanceProfileAssociationResult,
    __MetadataBearer {}
declare const ReplaceIamInstanceProfileAssociationCommand_base: {
  new (
    input: ReplaceIamInstanceProfileAssociationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceIamInstanceProfileAssociationCommandInput,
    ReplaceIamInstanceProfileAssociationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ReplaceIamInstanceProfileAssociationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceIamInstanceProfileAssociationCommandInput,
    ReplaceIamInstanceProfileAssociationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ReplaceIamInstanceProfileAssociationCommand extends ReplaceIamInstanceProfileAssociationCommand_base {
  protected static __types: {
    api: {
      input: ReplaceIamInstanceProfileAssociationRequest;
      output: ReplaceIamInstanceProfileAssociationResult;
    };
    sdk: {
      input: ReplaceIamInstanceProfileAssociationCommandInput;
      output: ReplaceIamInstanceProfileAssociationCommandOutput;
    };
  };
}
