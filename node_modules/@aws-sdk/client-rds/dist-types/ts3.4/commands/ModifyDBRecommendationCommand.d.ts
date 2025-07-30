import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBRecommendationMessage,
  ModifyDBRecommendationMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyDBRecommendationCommandInput
  extends ModifyDBRecommendationMessage {}
export interface ModifyDBRecommendationCommandOutput
  extends DBRecommendationMessage,
    __MetadataBearer {}
declare const ModifyDBRecommendationCommand_base: {
  new (
    input: ModifyDBRecommendationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBRecommendationCommandInput,
    ModifyDBRecommendationCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyDBRecommendationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBRecommendationCommandInput,
    ModifyDBRecommendationCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyDBRecommendationCommand extends ModifyDBRecommendationCommand_base {
  protected static __types: {
    api: {
      input: ModifyDBRecommendationMessage;
      output: DBRecommendationMessage;
    };
    sdk: {
      input: ModifyDBRecommendationCommandInput;
      output: ModifyDBRecommendationCommandOutput;
    };
  };
}
