import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateInstanceEventWindowRequest,
  AssociateInstanceEventWindowResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateInstanceEventWindowCommandInput
  extends AssociateInstanceEventWindowRequest {}
export interface AssociateInstanceEventWindowCommandOutput
  extends AssociateInstanceEventWindowResult,
    __MetadataBearer {}
declare const AssociateInstanceEventWindowCommand_base: {
  new (
    input: AssociateInstanceEventWindowCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateInstanceEventWindowCommandInput,
    AssociateInstanceEventWindowCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateInstanceEventWindowCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateInstanceEventWindowCommandInput,
    AssociateInstanceEventWindowCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateInstanceEventWindowCommand extends AssociateInstanceEventWindowCommand_base {
  protected static __types: {
    api: {
      input: AssociateInstanceEventWindowRequest;
      output: AssociateInstanceEventWindowResult;
    };
    sdk: {
      input: AssociateInstanceEventWindowCommandInput;
      output: AssociateInstanceEventWindowCommandOutput;
    };
  };
}
