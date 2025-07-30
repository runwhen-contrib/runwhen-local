import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  BundleInstanceRequest,
  BundleInstanceResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface BundleInstanceCommandInput extends BundleInstanceRequest {}
export interface BundleInstanceCommandOutput
  extends BundleInstanceResult,
    __MetadataBearer {}
declare const BundleInstanceCommand_base: {
  new (
    input: BundleInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    BundleInstanceCommandInput,
    BundleInstanceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: BundleInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    BundleInstanceCommandInput,
    BundleInstanceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class BundleInstanceCommand extends BundleInstanceCommand_base {
  protected static __types: {
    api: {
      input: BundleInstanceRequest;
      output: BundleInstanceResult;
    };
    sdk: {
      input: BundleInstanceCommandInput;
      output: BundleInstanceCommandOutput;
    };
  };
}
