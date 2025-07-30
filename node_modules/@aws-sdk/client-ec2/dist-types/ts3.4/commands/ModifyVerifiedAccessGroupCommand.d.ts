import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVerifiedAccessGroupRequest,
  ModifyVerifiedAccessGroupResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVerifiedAccessGroupCommandInput
  extends ModifyVerifiedAccessGroupRequest {}
export interface ModifyVerifiedAccessGroupCommandOutput
  extends ModifyVerifiedAccessGroupResult,
    __MetadataBearer {}
declare const ModifyVerifiedAccessGroupCommand_base: {
  new (
    input: ModifyVerifiedAccessGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVerifiedAccessGroupCommandInput,
    ModifyVerifiedAccessGroupCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVerifiedAccessGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVerifiedAccessGroupCommandInput,
    ModifyVerifiedAccessGroupCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVerifiedAccessGroupCommand extends ModifyVerifiedAccessGroupCommand_base {
  protected static __types: {
    api: {
      input: ModifyVerifiedAccessGroupRequest;
      output: ModifyVerifiedAccessGroupResult;
    };
    sdk: {
      input: ModifyVerifiedAccessGroupCommandInput;
      output: ModifyVerifiedAccessGroupCommandOutput;
    };
  };
}
