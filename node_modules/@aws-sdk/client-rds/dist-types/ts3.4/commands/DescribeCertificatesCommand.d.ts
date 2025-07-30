import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CertificateMessage,
  DescribeCertificatesMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeCertificatesCommandInput
  extends DescribeCertificatesMessage {}
export interface DescribeCertificatesCommandOutput
  extends CertificateMessage,
    __MetadataBearer {}
declare const DescribeCertificatesCommand_base: {
  new (
    input: DescribeCertificatesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCertificatesCommandInput,
    DescribeCertificatesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeCertificatesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCertificatesCommandInput,
    DescribeCertificatesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeCertificatesCommand extends DescribeCertificatesCommand_base {
  protected static __types: {
    api: {
      input: DescribeCertificatesMessage;
      output: CertificateMessage;
    };
    sdk: {
      input: DescribeCertificatesCommandInput;
      output: DescribeCertificatesCommandOutput;
    };
  };
}
