import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { CancelImportTaskRequest, CancelImportTaskResult } from "../models/models_0";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link CancelImportTaskCommand}.
 */
export interface CancelImportTaskCommandInput extends CancelImportTaskRequest {
}
/**
 * @public
 *
 * The output of {@link CancelImportTaskCommand}.
 */
export interface CancelImportTaskCommandOutput extends CancelImportTaskResult, __MetadataBearer {
}
declare const CancelImportTaskCommand_base: {
    new (input: CancelImportTaskCommandInput): import("@smithy/smithy-client").CommandImpl<CancelImportTaskCommandInput, CancelImportTaskCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [CancelImportTaskCommandInput]): import("@smithy/smithy-client").CommandImpl<CancelImportTaskCommandInput, CancelImportTaskCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Cancels an in-process import virtual machine or import snapshot task.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, CancelImportTaskCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, CancelImportTaskCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // CancelImportTaskRequest
 *   CancelReason: "STRING_VALUE",
 *   DryRun: true || false,
 *   ImportTaskId: "STRING_VALUE",
 * };
 * const command = new CancelImportTaskCommand(input);
 * const response = await client.send(command);
 * // { // CancelImportTaskResult
 * //   ImportTaskId: "STRING_VALUE",
 * //   PreviousState: "STRING_VALUE",
 * //   State: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param CancelImportTaskCommandInput - {@link CancelImportTaskCommandInput}
 * @returns {@link CancelImportTaskCommandOutput}
 * @see {@link CancelImportTaskCommandInput} for command's `input` shape.
 * @see {@link CancelImportTaskCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class CancelImportTaskCommand extends CancelImportTaskCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: CancelImportTaskRequest;
            output: CancelImportTaskResult;
        };
        sdk: {
            input: CancelImportTaskCommandInput;
            output: CancelImportTaskCommandOutput;
        };
    };
}
