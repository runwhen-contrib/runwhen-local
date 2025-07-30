import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVerifiedAccessEndpointRequest,
  ModifyVerifiedAccessEndpointResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVerifiedAccessEndpointCommandInput
  extends ModifyVerifiedAccessEndpointRequest {}
export interface ModifyVerifiedAccessEndpointCommandOutput
  extends ModifyVerifiedAccessEndpointResult,
    __MetadataBearer {}
declare const ModifyVerifiedAccessEndpointCommand_base: {
  new (
    input: ModifyVerifiedAccessEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVerifiedAccessEndpointCommandInput,
    ModifyVerifiedAccessEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVerifiedAccessEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVerifiedAccessEndpointCommandInput,
    ModifyVerifiedAccessEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVerifiedAccessEndpointCommand extends ModifyVerifiedAccessEndpointCommand_base {
  protected static __types: {
    api: {
      input: ModifyVerifiedAccessEndpointRequest;
      output: ModifyVerifiedAccessEndpointResult;
    };
    sdk: {
      input: ModifyVerifiedAccessEndpointCommandInput;
      output: ModifyVerifiedAccessEndpointCommandOutput;
    };
  };
}
