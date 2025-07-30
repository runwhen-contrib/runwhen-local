import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DeleteDBSubnetGroupMessage } from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteDBSubnetGroupCommandInput
  extends DeleteDBSubnetGroupMessage {}
export interface DeleteDBSubnetGroupCommandOutput extends __MetadataBearer {}
declare const DeleteDBSubnetGroupCommand_base: {
  new (
    input: DeleteDBSubnetGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBSubnetGroupCommandInput,
    DeleteDBSubnetGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteDBSubnetGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBSubnetGroupCommandInput,
    DeleteDBSubnetGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteDBSubnetGroupCommand extends DeleteDBSubnetGroupCommand_base {
  protected static __types: {
    api: {
      input: DeleteDBSubnetGroupMessage;
      output: {};
    };
    sdk: {
      input: DeleteDBSubnetGroupCommandInput;
      output: DeleteDBSubnetGroupCommandOutput;
    };
  };
}
