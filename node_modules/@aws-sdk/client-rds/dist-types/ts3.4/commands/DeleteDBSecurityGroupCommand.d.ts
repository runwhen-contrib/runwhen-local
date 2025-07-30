import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DeleteDBSecurityGroupMessage } from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteDBSecurityGroupCommandInput
  extends DeleteDBSecurityGroupMessage {}
export interface DeleteDBSecurityGroupCommandOutput extends __MetadataBearer {}
declare const DeleteDBSecurityGroupCommand_base: {
  new (
    input: DeleteDBSecurityGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBSecurityGroupCommandInput,
    DeleteDBSecurityGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteDBSecurityGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBSecurityGroupCommandInput,
    DeleteDBSecurityGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteDBSecurityGroupCommand extends DeleteDBSecurityGroupCommand_base {
  protected static __types: {
    api: {
      input: DeleteDBSecurityGroupMessage;
      output: {};
    };
    sdk: {
      input: DeleteDBSecurityGroupCommandInput;
      output: DeleteDBSecurityGroupCommandOutput;
    };
  };
}
