import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ImportClientVpnClientCertificateRevocationListRequest,
  ImportClientVpnClientCertificateRevocationListResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface ImportClientVpnClientCertificateRevocationListCommandInput
  extends ImportClientVpnClientCertificateRevocationListRequest {}
export interface ImportClientVpnClientCertificateRevocationListCommandOutput
  extends ImportClientVpnClientCertificateRevocationListResult,
    __MetadataBearer {}
declare const ImportClientVpnClientCertificateRevocationListCommand_base: {
  new (
    input: ImportClientVpnClientCertificateRevocationListCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ImportClientVpnClientCertificateRevocationListCommandInput,
    ImportClientVpnClientCertificateRevocationListCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ImportClientVpnClientCertificateRevocationListCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ImportClientVpnClientCertificateRevocationListCommandInput,
    ImportClientVpnClientCertificateRevocationListCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ImportClientVpnClientCertificateRevocationListCommand extends ImportClientVpnClientCertificateRevocationListCommand_base {
  protected static __types: {
    api: {
      input: ImportClientVpnClientCertificateRevocationListRequest;
      output: ImportClientVpnClientCertificateRevocationListResult;
    };
    sdk: {
      input: ImportClientVpnClientCertificateRevocationListCommandInput;
      output: ImportClientVpnClientCertificateRevocationListCommandOutput;
    };
  };
}
