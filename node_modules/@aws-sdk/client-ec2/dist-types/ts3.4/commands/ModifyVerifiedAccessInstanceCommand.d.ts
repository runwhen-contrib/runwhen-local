import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVerifiedAccessInstanceRequest,
  ModifyVerifiedAccessInstanceResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVerifiedAccessInstanceCommandInput
  extends ModifyVerifiedAccessInstanceRequest {}
export interface ModifyVerifiedAccessInstanceCommandOutput
  extends ModifyVerifiedAccessInstanceResult,
    __MetadataBearer {}
declare const ModifyVerifiedAccessInstanceCommand_base: {
  new (
    input: ModifyVerifiedAccessInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVerifiedAccessInstanceCommandInput,
    ModifyVerifiedAccessInstanceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVerifiedAccessInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVerifiedAccessInstanceCommandInput,
    ModifyVerifiedAccessInstanceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVerifiedAccessInstanceCommand extends ModifyVerifiedAccessInstanceCommand_base {
  protected static __types: {
    api: {
      input: ModifyVerifiedAccessInstanceRequest;
      output: ModifyVerifiedAccessInstanceResult;
    };
    sdk: {
      input: ModifyVerifiedAccessInstanceCommandInput;
      output: ModifyVerifiedAccessInstanceCommandOutput;
    };
  };
}
