import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { ListSnapshotsInRecycleBinRequest, ListSnapshotsInRecycleBinResult } from "../models/models_7";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link ListSnapshotsInRecycleBinCommand}.
 */
export interface ListSnapshotsInRecycleBinCommandInput extends ListSnapshotsInRecycleBinRequest {
}
/**
 * @public
 *
 * The output of {@link ListSnapshotsInRecycleBinCommand}.
 */
export interface ListSnapshotsInRecycleBinCommandOutput extends ListSnapshotsInRecycleBinResult, __MetadataBearer {
}
declare const ListSnapshotsInRecycleBinCommand_base: {
    new (input: ListSnapshotsInRecycleBinCommandInput): import("@smithy/smithy-client").CommandImpl<ListSnapshotsInRecycleBinCommandInput, ListSnapshotsInRecycleBinCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [ListSnapshotsInRecycleBinCommandInput]): import("@smithy/smithy-client").CommandImpl<ListSnapshotsInRecycleBinCommandInput, ListSnapshotsInRecycleBinCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Lists one or more snapshots that are currently in the Recycle Bin.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, ListSnapshotsInRecycleBinCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, ListSnapshotsInRecycleBinCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // ListSnapshotsInRecycleBinRequest
 *   MaxResults: Number("int"),
 *   NextToken: "STRING_VALUE",
 *   SnapshotIds: [ // SnapshotIdStringList
 *     "STRING_VALUE",
 *   ],
 *   DryRun: true || false,
 * };
 * const command = new ListSnapshotsInRecycleBinCommand(input);
 * const response = await client.send(command);
 * // { // ListSnapshotsInRecycleBinResult
 * //   Snapshots: [ // SnapshotRecycleBinInfoList
 * //     { // SnapshotRecycleBinInfo
 * //       SnapshotId: "STRING_VALUE",
 * //       RecycleBinEnterTime: new Date("TIMESTAMP"),
 * //       RecycleBinExitTime: new Date("TIMESTAMP"),
 * //       Description: "STRING_VALUE",
 * //       VolumeId: "STRING_VALUE",
 * //     },
 * //   ],
 * //   NextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param ListSnapshotsInRecycleBinCommandInput - {@link ListSnapshotsInRecycleBinCommandInput}
 * @returns {@link ListSnapshotsInRecycleBinCommandOutput}
 * @see {@link ListSnapshotsInRecycleBinCommandInput} for command's `input` shape.
 * @see {@link ListSnapshotsInRecycleBinCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class ListSnapshotsInRecycleBinCommand extends ListSnapshotsInRecycleBinCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: ListSnapshotsInRecycleBinRequest;
            output: ListSnapshotsInRecycleBinResult;
        };
        sdk: {
            input: ListSnapshotsInRecycleBinCommandInput;
            output: ListSnapshotsInRecycleBinCommandOutput;
        };
    };
}
