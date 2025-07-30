import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyTrafficMirrorFilterNetworkServicesRequest,
  ModifyTrafficMirrorFilterNetworkServicesResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyTrafficMirrorFilterNetworkServicesCommandInput
  extends ModifyTrafficMirrorFilterNetworkServicesRequest {}
export interface ModifyTrafficMirrorFilterNetworkServicesCommandOutput
  extends ModifyTrafficMirrorFilterNetworkServicesResult,
    __MetadataBearer {}
declare const ModifyTrafficMirrorFilterNetworkServicesCommand_base: {
  new (
    input: ModifyTrafficMirrorFilterNetworkServicesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyTrafficMirrorFilterNetworkServicesCommandInput,
    ModifyTrafficMirrorFilterNetworkServicesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyTrafficMirrorFilterNetworkServicesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyTrafficMirrorFilterNetworkServicesCommandInput,
    ModifyTrafficMirrorFilterNetworkServicesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyTrafficMirrorFilterNetworkServicesCommand extends ModifyTrafficMirrorFilterNetworkServicesCommand_base {
  protected static __types: {
    api: {
      input: ModifyTrafficMirrorFilterNetworkServicesRequest;
      output: ModifyTrafficMirrorFilterNetworkServicesResult;
    };
    sdk: {
      input: ModifyTrafficMirrorFilterNetworkServicesCommandInput;
      output: ModifyTrafficMirrorFilterNetworkServicesCommandOutput;
    };
  };
}
