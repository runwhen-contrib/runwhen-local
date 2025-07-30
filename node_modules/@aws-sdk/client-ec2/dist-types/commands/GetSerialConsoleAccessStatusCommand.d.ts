import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { GetSerialConsoleAccessStatusRequest, GetSerialConsoleAccessStatusResult } from "../models/models_6";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link GetSerialConsoleAccessStatusCommand}.
 */
export interface GetSerialConsoleAccessStatusCommandInput extends GetSerialConsoleAccessStatusRequest {
}
/**
 * @public
 *
 * The output of {@link GetSerialConsoleAccessStatusCommand}.
 */
export interface GetSerialConsoleAccessStatusCommandOutput extends GetSerialConsoleAccessStatusResult, __MetadataBearer {
}
declare const GetSerialConsoleAccessStatusCommand_base: {
    new (input: GetSerialConsoleAccessStatusCommandInput): import("@smithy/smithy-client").CommandImpl<GetSerialConsoleAccessStatusCommandInput, GetSerialConsoleAccessStatusCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [GetSerialConsoleAccessStatusCommandInput]): import("@smithy/smithy-client").CommandImpl<GetSerialConsoleAccessStatusCommandInput, GetSerialConsoleAccessStatusCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Retrieves the access status of your account to the EC2 serial console of all instances. By
 * 			default, access to the EC2 serial console is disabled for your account. For more
 * 			information, see <a href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configure-access-to-serial-console.html#serial-console-account-access">Manage account access to the EC2 serial console</a> in the <i>Amazon EC2
 * 				User Guide</i>.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, GetSerialConsoleAccessStatusCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, GetSerialConsoleAccessStatusCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // GetSerialConsoleAccessStatusRequest
 *   DryRun: true || false,
 * };
 * const command = new GetSerialConsoleAccessStatusCommand(input);
 * const response = await client.send(command);
 * // { // GetSerialConsoleAccessStatusResult
 * //   SerialConsoleAccessEnabled: true || false,
 * //   ManagedBy: "account" || "declarative-policy",
 * // };
 *
 * ```
 *
 * @param GetSerialConsoleAccessStatusCommandInput - {@link GetSerialConsoleAccessStatusCommandInput}
 * @returns {@link GetSerialConsoleAccessStatusCommandOutput}
 * @see {@link GetSerialConsoleAccessStatusCommandInput} for command's `input` shape.
 * @see {@link GetSerialConsoleAccessStatusCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class GetSerialConsoleAccessStatusCommand extends GetSerialConsoleAccessStatusCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: GetSerialConsoleAccessStatusRequest;
            output: GetSerialConsoleAccessStatusResult;
        };
        sdk: {
            input: GetSerialConsoleAccessStatusCommandInput;
            output: GetSerialConsoleAccessStatusCommandOutput;
        };
    };
}
