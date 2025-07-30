import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeTransitGatewayPolicyTablesRequest, DescribeTransitGatewayPolicyTablesResult } from "../models/models_5";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeTransitGatewayPolicyTablesCommand}.
 */
export interface DescribeTransitGatewayPolicyTablesCommandInput extends DescribeTransitGatewayPolicyTablesRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeTransitGatewayPolicyTablesCommand}.
 */
export interface DescribeTransitGatewayPolicyTablesCommandOutput extends DescribeTransitGatewayPolicyTablesResult, __MetadataBearer {
}
declare const DescribeTransitGatewayPolicyTablesCommand_base: {
    new (input: DescribeTransitGatewayPolicyTablesCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeTransitGatewayPolicyTablesCommandInput, DescribeTransitGatewayPolicyTablesCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeTransitGatewayPolicyTablesCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeTransitGatewayPolicyTablesCommandInput, DescribeTransitGatewayPolicyTablesCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes one or more transit gateway route policy tables.  </p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeTransitGatewayPolicyTablesCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeTransitGatewayPolicyTablesCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeTransitGatewayPolicyTablesRequest
 *   TransitGatewayPolicyTableIds: [ // TransitGatewayPolicyTableIdStringList
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
 *   MaxResults: Number("int"),
 *   NextToken: "STRING_VALUE",
 *   DryRun: true || false,
 * };
 * const command = new DescribeTransitGatewayPolicyTablesCommand(input);
 * const response = await client.send(command);
 * // { // DescribeTransitGatewayPolicyTablesResult
 * //   TransitGatewayPolicyTables: [ // TransitGatewayPolicyTableList
 * //     { // TransitGatewayPolicyTable
 * //       TransitGatewayPolicyTableId: "STRING_VALUE",
 * //       TransitGatewayId: "STRING_VALUE",
 * //       State: "pending" || "available" || "deleting" || "deleted",
 * //       CreationTime: new Date("TIMESTAMP"),
 * //       Tags: [ // TagList
 * //         { // Tag
 * //           Key: "STRING_VALUE",
 * //           Value: "STRING_VALUE",
 * //         },
 * //       ],
 * //     },
 * //   ],
 * //   NextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param DescribeTransitGatewayPolicyTablesCommandInput - {@link DescribeTransitGatewayPolicyTablesCommandInput}
 * @returns {@link DescribeTransitGatewayPolicyTablesCommandOutput}
 * @see {@link DescribeTransitGatewayPolicyTablesCommandInput} for command's `input` shape.
 * @see {@link DescribeTransitGatewayPolicyTablesCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeTransitGatewayPolicyTablesCommand extends DescribeTransitGatewayPolicyTablesCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeTransitGatewayPolicyTablesRequest;
            output: DescribeTransitGatewayPolicyTablesResult;
        };
        sdk: {
            input: DescribeTransitGatewayPolicyTablesCommandInput;
            output: DescribeTransitGatewayPolicyTablesCommandOutput;
        };
    };
}
