import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { ModifyInstanceMetadataDefaultsRequest, ModifyInstanceMetadataDefaultsResult } from "../models/models_7";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link ModifyInstanceMetadataDefaultsCommand}.
 */
export interface ModifyInstanceMetadataDefaultsCommandInput extends ModifyInstanceMetadataDefaultsRequest {
}
/**
 * @public
 *
 * The output of {@link ModifyInstanceMetadataDefaultsCommand}.
 */
export interface ModifyInstanceMetadataDefaultsCommandOutput extends ModifyInstanceMetadataDefaultsResult, __MetadataBearer {
}
declare const ModifyInstanceMetadataDefaultsCommand_base: {
    new (input: ModifyInstanceMetadataDefaultsCommandInput): import("@smithy/smithy-client").CommandImpl<ModifyInstanceMetadataDefaultsCommandInput, ModifyInstanceMetadataDefaultsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [ModifyInstanceMetadataDefaultsCommandInput]): import("@smithy/smithy-client").CommandImpl<ModifyInstanceMetadataDefaultsCommandInput, ModifyInstanceMetadataDefaultsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Modifies the default instance metadata service (IMDS) settings at the account level in
 *             the specified Amazon Web Services
 Region.</p>
 *          <note>
 *             <p>To remove a parameter's account-level default setting, specify
 *                     <code>no-preference</code>. If an account-level setting is cleared with
 *                     <code>no-preference</code>, then the instance launch considers the other
 *                 instance metadata settings. For more information, see <a href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-options.html#instance-metadata-options-order-of-precedence">Order of precedence for instance metadata options</a> in the
 *                     <i>Amazon EC2 User Guide</i>.</p>
 *          </note>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, ModifyInstanceMetadataDefaultsCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, ModifyInstanceMetadataDefaultsCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // ModifyInstanceMetadataDefaultsRequest
 *   HttpTokens: "optional" || "required" || "no-preference",
 *   HttpPutResponseHopLimit: Number("int"),
 *   HttpEndpoint: "disabled" || "enabled" || "no-preference",
 *   InstanceMetadataTags: "disabled" || "enabled" || "no-preference",
 *   DryRun: true || false,
 * };
 * const command = new ModifyInstanceMetadataDefaultsCommand(input);
 * const response = await client.send(command);
 * // { // ModifyInstanceMetadataDefaultsResult
 * //   Return: true || false,
 * // };
 *
 * ```
 *
 * @param ModifyInstanceMetadataDefaultsCommandInput - {@link ModifyInstanceMetadataDefaultsCommandInput}
 * @returns {@link ModifyInstanceMetadataDefaultsCommandOutput}
 * @see {@link ModifyInstanceMetadataDefaultsCommandInput} for command's `input` shape.
 * @see {@link ModifyInstanceMetadataDefaultsCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class ModifyInstanceMetadataDefaultsCommand extends ModifyInstanceMetadataDefaultsCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: ModifyInstanceMetadataDefaultsRequest;
            output: ModifyInstanceMetadataDefaultsResult;
        };
        sdk: {
            input: ModifyInstanceMetadataDefaultsCommandInput;
            output: ModifyInstanceMetadataDefaultsCommandOutput;
        };
    };
}
