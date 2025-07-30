import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateIamInstanceProfileRequest,
  AssociateIamInstanceProfileResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateIamInstanceProfileCommandInput
  extends AssociateIamInstanceProfileRequest {}
export interface AssociateIamInstanceProfileCommandOutput
  extends AssociateIamInstanceProfileResult,
    __MetadataBearer {}
declare const AssociateIamInstanceProfileCommand_base: {
  new (
    input: AssociateIamInstanceProfileCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateIamInstanceProfileCommandInput,
    AssociateIamInstanceProfileCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateIamInstanceProfileCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateIamInstanceProfileCommandInput,
    AssociateIamInstanceProfileCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateIamInstanceProfileCommand extends AssociateIamInstanceProfileCommand_base {
  protected static __types: {
    api: {
      input: AssociateIamInstanceProfileRequest;
      output: AssociateIamInstanceProfileResult;
    };
    sdk: {
      input: AssociateIamInstanceProfileCommandInput;
      output: AssociateIamInstanceProfileCommandOutput;
    };
  };
}
