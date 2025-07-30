import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ModifyDBProxyTargetGroupRequest,
  ModifyDBProxyTargetGroupResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyDBProxyTargetGroupCommandInput
  extends ModifyDBProxyTargetGroupRequest {}
export interface ModifyDBProxyTargetGroupCommandOutput
  extends ModifyDBProxyTargetGroupResponse,
    __MetadataBearer {}
declare const ModifyDBProxyTargetGroupCommand_base: {
  new (
    input: ModifyDBProxyTargetGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBProxyTargetGroupCommandInput,
    ModifyDBProxyTargetGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyDBProxyTargetGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBProxyTargetGroupCommandInput,
    ModifyDBProxyTargetGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyDBProxyTargetGroupCommand extends ModifyDBProxyTargetGroupCommand_base {
  protected static __types: {
    api: {
      input: ModifyDBProxyTargetGroupRequest;
      output: ModifyDBProxyTargetGroupResponse;
    };
    sdk: {
      input: ModifyDBProxyTargetGroupCommandInput;
      output: ModifyDBProxyTargetGroupCommandOutput;
    };
  };
}
