import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateTrunkInterfaceRequest,
  AssociateTrunkInterfaceResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateTrunkInterfaceCommandInput
  extends AssociateTrunkInterfaceRequest {}
export interface AssociateTrunkInterfaceCommandOutput
  extends AssociateTrunkInterfaceResult,
    __MetadataBearer {}
declare const AssociateTrunkInterfaceCommand_base: {
  new (
    input: AssociateTrunkInterfaceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateTrunkInterfaceCommandInput,
    AssociateTrunkInterfaceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateTrunkInterfaceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateTrunkInterfaceCommandInput,
    AssociateTrunkInterfaceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateTrunkInterfaceCommand extends AssociateTrunkInterfaceCommand_base {
  protected static __types: {
    api: {
      input: AssociateTrunkInterfaceRequest;
      output: AssociateTrunkInterfaceResult;
    };
    sdk: {
      input: AssociateTrunkInterfaceCommandInput;
      output: AssociateTrunkInterfaceCommandOutput;
    };
  };
}
