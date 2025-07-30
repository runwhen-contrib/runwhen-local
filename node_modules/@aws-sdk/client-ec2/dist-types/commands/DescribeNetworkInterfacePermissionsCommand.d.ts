import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeNetworkInterfacePermissionsRequest, DescribeNetworkInterfacePermissionsResult } from "../models/models_5";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeNetworkInterfacePermissionsCommand}.
 */
export interface DescribeNetworkInterfacePermissionsCommandInput extends DescribeNetworkInterfacePermissionsRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeNetworkInterfacePermissionsCommand}.
 */
export interface DescribeNetworkInterfacePermissionsCommandOutput extends DescribeNetworkInterfacePermissionsResult, __MetadataBearer {
}
declare const DescribeNetworkInterfacePermissionsCommand_base: {
    new (input: DescribeNetworkInterfacePermissionsCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeNetworkInterfacePermissionsCommandInput, DescribeNetworkInterfacePermissionsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeNetworkInterfacePermissionsCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeNetworkInterfacePermissionsCommandInput, DescribeNetworkInterfacePermissionsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes the permissions for your network interfaces. </p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeNetworkInterfacePermissionsCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeNetworkInterfacePermissionsCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeNetworkInterfacePermissionsRequest
 *   NetworkInterfacePermissionIds: [ // NetworkInterfacePermissionIdList
 *     "STRING_VALUE",
 *   ],
 *   Filters: [ // FilterList
 *     { // Filter
 *       Name: "STRING_VALUE",
 *       Values: [ // ValueStringList
 *         "STRING_VALUE",
 *       ],
 *     },
 *   ],
 *   NextToken: "STRING_VALUE",
 *   MaxResults: Number("int"),
 * };
 * const command = new DescribeNetworkInterfacePermissionsCommand(input);
 * const response = await client.send(command);
 * // { // DescribeNetworkInterfacePermissionsResult
 * //   NetworkInterfacePermissions: [ // NetworkInterfacePermissionList
 * //     { // NetworkInterfacePermission
 * //       NetworkInterfacePermissionId: "STRING_VALUE",
 * //       NetworkInterfaceId: "STRING_VALUE",
 * //       AwsAccountId: "STRING_VALUE",
 * //       AwsService: "STRING_VALUE",
 * //       Permission: "INSTANCE-ATTACH" || "EIP-ASSOCIATE",
 * //       PermissionState: { // NetworkInterfacePermissionState
 * //         State: "pending" || "granted" || "revoking" || "revoked",
 * //         StatusMessage: "STRING_VALUE",
 * //       },
 * //     },
 * //   ],
 * //   NextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param DescribeNetworkInterfacePermissionsCommandInput - {@link DescribeNetworkInterfacePermissionsCommandInput}
 * @returns {@link DescribeNetworkInterfacePermissionsCommandOutput}
 * @see {@link DescribeNetworkInterfacePermissionsCommandInput} for command's `input` shape.
 * @see {@link DescribeNetworkInterfacePermissionsCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeNetworkInterfacePermissionsCommand extends DescribeNetworkInterfacePermissionsCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeNetworkInterfacePermissionsRequest;
            output: DescribeNetworkInterfacePermissionsResult;
        };
        sdk: {
            input: DescribeNetworkInterfacePermissionsCommandInput;
            output: DescribeNetworkInterfacePermissionsCommandOutput;
        };
    };
}
